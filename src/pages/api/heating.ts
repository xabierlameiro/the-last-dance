import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * @description Get the heating grades inside the house and the outside temperature
 * @param _req NextApiRequest
 * @param res NextApiResponse
 * @returns {Promise<{ outsideTemp: number; ZoneMeasuredTemp: number; } | { statusCode: number; message: string; }>}
 * @example localhost:3000/api/heating
 */
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
    try {
        const response = await fetch(
            'https://www.ariston-net.remotethermo.com/R2/PlantHome/GetData/A8032A1A96D4?umsys=si',
            {
                headers: {
                    accept: 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
                    'ajax-request': 'json',
                    'content-type': 'application/json; charset=UTF-8',
                    'sec-ch-ua': '"Not_A Brand";v="99", "Google Chrome";v="109", "Chromium";v="109"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"macOS"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest',
                    cookie: `${process.env.NEXT_PUBLIC_HEATING}`,
                },
                referrerPolicy: 'no-referrer',
                body: '{"features":{"zones":[{"num":1,"name":"Planta superior","roomSens":false,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":2,"name":"Salón","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":3,"name":"Pasillo","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":4,"name":"Habitación","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":5,"name":"Habitación 2","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false},{"num":6,"name":"Estudio","roomSens":true,"geofenceDeroga":false,"virtInfo":null,"isHidden":false}],"solar":false,"convBoiler":false,"hpSys":true,"hybridSys":false,"cascadeSys":false,"dhwProgSupported":true,"virtualZones":false,"hasVmc":false,"extendedTimeProg":false,"hasBoiler":false,"commBoiler":false,"pilotSupported":false,"isVmcR2":false,"isEvo2":false,"dhwHidden":false,"dhwBoilerPresent":true,"dhwModeChangeable":true,"hvInputOff":true,"autoThermoReg":true,"hasMetering":true,"weatherProvider":1,"hasFireplace":false,"hasSlp":false,"hasEm20":false,"hasTwoCoolingTemp":false,"bmsActive":false,"hpCascadeSys":false,"hpCascadeConfig":-1,"bufferTimeProgAvailable":false,"distinctHeatCoolSetpoints":false,"hasZoneNames":false,"hasGahp":false,"hydraulicScheme":5,"preHeatingSupported":false,"zigbeeActive":false},"useCache":true,"zone":1,"filter":{"notEssentials":false,"progId":null,"plant":true,"zone":true,"dhw":true}}',
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
            }
        );

        const data = await response.json().catch((err: Error | unknown) => {
            if (err instanceof Error) {
                res.status(500).json({ error: err.message });
            }
        });

        const outsideTemp = data.data.items?.find((item: any) => item.id === 'OutsideTemp').value;

        const zoneMeasuredTemp = data.data.items?.find((item: any) => item.id === 'ZoneMeasuredTemp').value;

        res.status(200).json({
            outsideTemp,
            zoneMeasuredTemp,
        });
    } catch (err: Error | unknown) {
        if (err instanceof Error) {
            res.status(500).json({ error: err.message });
        }
    }
}
