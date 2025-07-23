import { NextResponse } from 'next/server'
import { handleCors } from '../../../helpers/cors'

interface HeatingData {
    outsideTemp: number;
    zoneMeasuredTemp: number;
}

interface AristonLoginResponse {
    success: boolean;
    token?: string;
    appCookie?: string;
}

interface AristonDataResponse {
    data: {
        items: Array<{ id: string; value: number }>;
    };
}

/**
 * @description Get the heating temperatures inside the house and outside using Ariston API
 * @example GET /api/heating
 */
export async function GET() {
    try {
        const heatingCredentials = process.env.NEXT_PUBLIC_HEATING;
        
        if (!heatingCredentials) {
            throw new Error('Heating credentials not configured');
        }

        const loginResult = await authenticateAriston(heatingCredentials);
        
        if (!loginResult.success || !loginResult.token || !loginResult.appCookie) {
            throw new Error('Failed to authenticate with Ariston service');
        }

        const heatingData = await fetchHeatingData(loginResult.token, loginResult.appCookie);
        
        const response = NextResponse.json(heatingData);
        return handleCors(response);

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error('Heating API error:', errorMessage);
        
        const errorResponse = NextResponse.json({ error: errorMessage }, { status: 500 });
        return handleCors(errorResponse);
    }
}

async function authenticateAriston(credentials: string): Promise<AristonLoginResponse> {
    try {
        const response = await fetch(
            'https://www.ariston-net.remotethermo.com/R2/Account/Login?returnUrl=%2FR2%2FHome',
            {
                method: 'POST',
                headers: {
                    'content-type': 'application/json; charset=UTF-8',
                    'x-requested-with': 'XMLHttpRequest',
                    'user-agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
                },
                body: credentials,
            }
        );

        if (!response.ok) {
            throw new Error(`Authentication failed: ${response.status}`);
        }

        const cookies = response.headers.get('set-cookie');
        
        if (!cookies) {
            throw new Error('No authentication cookies received');
        }

        const token = cookies.split('ar.loggedUser=')[1]?.split(';')[0];
        const appCookie = cookies.split('.AspNet.ApplicationCookie=')[1]?.split(';')[0];

        if (!token || !appCookie) {
            throw new Error('Failed to extract authentication tokens');
        }

        return {
            success: true,
            token,
            appCookie,
        };

    } catch (error) {
        console.error('Ariston authentication error:', error);
        return {
            success: false,
        };
    }
}

async function fetchHeatingData(token: string, appCookie: string): Promise<HeatingData> {
    const response = await fetch(
        'https://www.ariston-net.remotethermo.com/R2/PlantHome/GetData/A8032A1A96D4?umsys=si',
        {
            method: 'POST',
            headers: {
                cookie: `ar.loggedUser=${token}; .AspNet.ApplicationCookie=${appCookie}`,
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (compatible; XabierLameiro/1.0)',
            },
            body: JSON.stringify({
                features: {
                    zones: [
                        { num: 1, name: "Planta superior", roomSens: false, geofenceDeroga: false, virtInfo: null, isHidden: false },
                        { num: 2, name: "Salón", roomSens: true, geofenceDeroga: false, virtInfo: null, isHidden: false },
                        { num: 3, name: "Pasillo", roomSens: true, geofenceDeroga: false, virtInfo: null, isHidden: false },
                        { num: 4, name: "Habitación", roomSens: true, geofenceDeroga: false, virtInfo: null, isHidden: false },
                        { num: 5, name: "Habitación 2", roomSens: true, geofenceDeroga: false, virtInfo: null, isHidden: false },
                        { num: 6, name: "Estudio", roomSens: true, geofenceDeroga: false, virtInfo: null, isHidden: false }
                    ],
                    solar: false,
                    convBoiler: false,
                    hpSys: true,
                    hybridSys: false,
                    cascadeSys: false,
                    dhwProgSupported: true,
                    virtualZones: false,
                    hasVmc: false,
                    extendedTimeProg: false,
                    hasBoiler: false,
                    commBoiler: false,
                    pilotSupported: false,
                    isVmcR2: false,
                    isEvo2: false,
                    dhwHidden: false,
                    dhwBoilerPresent: true,
                    dhwModeChangeable: true,
                    hvInputOff: true,
                    autoThermoReg: true,
                    hasMetering: true,
                    weatherProvider: 1,
                    hasFireplace: false,
                    hasSlp: false,
                    hasEm20: false,
                    hasTwoCoolingTemp: false,
                    bmsActive: false,
                    hpCascadeSys: false,
                    hpCascadeConfig: -1,
                    bufferTimeProgAvailable: false,
                    distinctHeatCoolSetpoints: false,
                    hasZoneNames: false,
                    hasGahp: false,
                    hydraulicScheme: 5,
                    preHeatingSupported: false,
                    zigbeeActive: false
                },
                useCache: true,
                zone: 1,
                filter: {
                    notEssentials: false,
                    progId: null,
                    plant: true,
                    zone: true,
                    dhw: true
                }
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch heating data: ${response.status}`);
    }

    const data: AristonDataResponse = await response.json();
    const terms = data.data?.items;

    if (!terms || !Array.isArray(terms)) {
        throw new Error('Invalid heating data response format');
    }

    const outsideTemp = terms.find((item) => item.id === 'OutsideTemp')?.value ?? 0;
    const zoneMeasuredTemp = terms.find((item) => item.id === 'ZoneMeasuredTemp')?.value ?? 0;

    return {
        outsideTemp,
        zoneMeasuredTemp,
    };
}