import type { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '../../helpers/cors';

/**
 * @description Get the heating grades inside the house and the outside temperature
 * @param _req NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<{ outsideTemp: number; ZoneMeasuredTemp: number; } | { statusCode: number; message: string; }>}
 * @example localhost:3000/api/heating
 */
export default allowCors(async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        const value = await fetch('https://www.ariston-net.remotethermo.com/R2/Account/Login?returnUrl=%2FR2%2FHome', {
            method: 'POST',
            headers: {
                'content-type': 'application/json; charset=UTF-8',
                'x-requested-with': 'XMLHttpRequest',
            },
            body: `${process.env.NEXT_PUBLIC_HEATING}`,
        })
            .then(async (response) => {
                const cookies = response.headers.get('set-cookie');
                const token = cookies?.split('ar.loggedUser=')[1].split(';')[0];
                const appCookie = cookies?.split('.AspNet.ApplicationCookie=')[1].split(';')[0];

                const data = await fetch(
                    'https://www.ariston-net.remotethermo.com/R2/PlantHome/GetData/A8032A1A96D4?umsys=si',
                    {
                        method: 'POST',
                        headers: {
                            cookie: `ar.loggedUser=${token}; .AspNet.ApplicationCookie=${appCookie}`,
                        },
                        body: '{"features":{"zones":[{"num":1,"name":"Planta superior","roomSens":false,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":2,"name":"Salón","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":3,"name":"Pasillo","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":4,"name":"Habitación","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":5,"name":"Habitación 2","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":6,"name":"Estudio","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false}],"solar":false,"convBoiler":false,"hpSys":true,"hybridSys":false,"cascadeSys":false,"dhwProgSupported":true,"virtualZones":false,"hasVmc":false,"extendedTimeProg":false,"hasBoiler":false,"commBoiler":false,"pilotSupported":false,"isVmcR2":false,"isEvo2":false,"dhwHidden":false,"dhwBoilerPresent":true,"dhwModeChangeable":true,"hvInputOff":true,"autoThermoReg":true,"hasMetering":true,"weatherProvider":1,"hasFireplace":false,"hasSlp":false,"hasEm20":false,"hasTwoCoolingTemp":false,"bmsActive":false,"hpCascadeSys":false,"hpCascadeConfig":-1,"bufferTimeProgAvailable":false,"distinctHeatCoolSetpoints":false,"hasZoneNames":false,"hasGahp":false,"hydraulicScheme":5,"preHeatingSupported":false,"zigbeeActive":false},"useCache":true,"zone":1,"filter":{"notEssentials":false,"progId":null,"plant":true,"zone":true,"dhw":true}}',
                    }
                );

                return await data.json().then((res) => {
                    const terms = res['data']['items'];
                    const outsideTemp = terms.find((item: any) => item.id === 'OutsideTemp').value;
                    const zoneMeasuredTemp = terms.find((item: any) => item.id === 'ZoneMeasuredTemp').value;

                    return {
                        outsideTemp,
                        zoneMeasuredTemp,
                    };
                });
            })
            .catch((error) => error);

        res.status(200).json(value);
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
});
