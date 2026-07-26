import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';
import { CACHE, fetchWithTimeout } from '@/helpers/http';

interface HeatingData {
    outsideTemp: number;
    zoneMeasuredTemp: number;
}

type HeatingResponse = HeatingData | { error: string };

/**
 * Cached Ariston session.
 *
 * SDD-L02. This route used to POST the owner's real account credentials to Ariston's login endpoint
 * on **every request**, with no auth, no rate limit and no cache in front of it. Since the endpoint is
 * public and the repository is public, an anonymous loop drove thousands of login attempts against
 * that account from Vercel egress IPs — expected outcome being a lockout, i.e. an unauthenticated GET
 * causing the owner to lose remote control of their own heating.
 *
 * Two layers now stand in the way: the `Cache-Control` header below (so the CDN answers most callers
 * without invoking the function at all) and this session reuse (so the calls that do land share one
 * login). Module scope on a serverless platform is per-instance, not global — that is fine, it
 * divides logins by an instance's request count rather than eliminating them, and there is no shared
 * store to depend on.
 *
 * The TTL is deliberately shorter than a typical session lifetime so an expiring cookie is replaced
 * before it fails, and `login()` is re-entered on any failure so a stale cookie degrades to one extra
 * login rather than a broken widget.
 */
const SESSION_TTL_MS = 15 * 60 * 1000;

type Session = { token: string; appCookie: string; expiresAt: number };

let cachedSession: Session | null = null;

/**
 * @description Get the heating grades inside the house and the outside temperature
 * @param _req NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<{ outsideTemp: number; ZoneMeasuredTemp: number; } | { statusCode: number; message: string; }>}
 * @example localhost:3000/api/heating
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse<HeatingResponse>) {
    // HEATING_CREDENTIALS must NOT use the NEXT_PUBLIC_ prefix: it holds the Ariston
    // account login payload and Next inlines every NEXT_PUBLIC_* value into the client
    // bundle. A NEXT_PUBLIC_HEATING fallback used to sit here, which would have published
    // those credentials the moment anyone set it — read the server-only name and nothing else.
    const credentials = process.env.HEATING_CREDENTIALS;
    if (!credentials) {
        console.error('Missing HEATING_CREDENTIALS environment variable');
        res.setHeader('Cache-Control', CACHE.error);
        return res.status(500).json({ error: 'Configuration error' });
    }

    /**
     * @description Log in to Ariston and cache the resulting session cookies.
     * @returns {Promise<Session>}
     */
    const login = async (): Promise<Session> => {
        const response = await fetchWithTimeout(
            'https://www.ariston-net.remotethermo.com/R2/Account/Login?returnUrl=%2FR2%2FHome',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                    'x-requested-with': 'XMLHttpRequest',
                },
                body: credentials,
            }
        );

        const cookies = response.headers.get('set-cookie');
        const token = cookies?.split('ar.loggedUser=')[1]?.split(';')[0];
        const appCookie = cookies?.split('.AspNet.ApplicationCookie=')[1]?.split(';')[0];

        if (!token || !appCookie) {
            throw new Error(`Ariston login failed (status ${response.status}): session cookies missing`);
        }

        const session = { token, appCookie, expiresAt: Date.now() + SESSION_TTL_MS };
        cachedSession = session;
        return session;
    };

    /**
     * @description Read plant data with a given session. Separated from `login` so the caller can
     * retry once with a fresh session when a cached cookie has gone stale.
     * @param {Session} session - Session to authenticate the read with.
     * @returns {Promise<HeatingData>}
     */
    const readPlantData = async (session: Session): Promise<HeatingData> => {
        const data = await fetchWithTimeout(
            'https://www.ariston-net.remotethermo.com/R2/PlantHome/GetData/A8032A1A96D4?umsys=si',
            {
                method: 'POST',
                headers: {
                    cookie: `ar.loggedUser=${session.token}; .AspNet.ApplicationCookie=${session.appCookie}`,
                },
                body: '{"features":{"zones":[{"num":1,"name":"Planta superior","roomSens":false,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":2,"name":"Salón","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":3,"name":"Pasillo","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":4,"name":"Habitación","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":5,"name":"Habitación 2","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":6,"name":"Estudio","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false}],"solar":false,"convBoiler":false,"hpSys":true,"hybridSys":false,"cascadeSys":false,"dhwProgSupported":true,"virtualZones":false,"hasVmc":false,"extendedTimeProg":false,"hasBoiler":false,"commBoiler":false,"pilotSupported":false,"isVmcR2":false,"isEvo2":false,"dhwHidden":false,"dhwBoilerPresent":true,"dhwModeChangeable":true,"hvInputOff":true,"autoThermoReg":true,"hasMetering":true,"weatherProvider":1,"hasFireplace":false,"hasSlp":false,"hasEm20":false,"hasTwoCoolingTemp":false,"bmsActive":false,"hpCascadeSys":false,"hpCascadeConfig":-1,"bufferTimeProgAvailable":false,"distinctHeatCoolSetpoints":false,"hasZoneNames":false,"hasGahp":false,"hydraulicScheme":5,"preHeatingSupported":false,"zigbeeActive":false},"useCache":true,"zone":1,"filter":{"notEssentials":false,"progId":null,"plant":true,"zone":true,"dhw":true}}',
            }
        );

        const payload = await data.json();
        const terms: Array<{ id: string; value: number }> | undefined = payload?.data?.items;
        if (!terms) {
            throw new Error('Ariston response missing data.items');
        }

        return {
            outsideTemp: terms.find((item) => item.id === 'OutsideTemp')?.value ?? 0,
            zoneMeasuredTemp: terms.find((item) => item.id === 'ZoneMeasuredTemp')?.value ?? 0,
        };
    };

    try {
        const cached = cachedSession && cachedSession.expiresAt > Date.now() ? cachedSession : null;
        let value: HeatingData;

        if (cached) {
            try {
                value = await readPlantData(cached);
            } catch {
                // A cached cookie can be revoked upstream before its TTL expires. Drop it and
                // re-authenticate once, so a stale session costs one extra login rather than
                // breaking the widget until the TTL runs out.
                cachedSession = null;
                value = await readPlantData(await login());
            }
        } else {
            value = await readPlantData(await login());
        }

        res.setHeader('Cache-Control', CACHE.heating);
        res.status(200).json(value);
    } catch (err: unknown) {
        console.error('Heating API Error:', err);
        res.setHeader('Cache-Control', CACHE.error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
