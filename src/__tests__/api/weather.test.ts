import fetchMock from 'jest-fetch-mock';
import handler from '../../pages/api/weather';
import { createMockResponse } from '../../__test__/apiMocks';


const GEO_FIXTURE = JSON.stringify({
    results: [{ latitude: 52.66, longitude: -8.63, name: 'Limerick', country: 'Ireland' }],
});

const forecastFixture = (weatherCode: number) =>
    JSON.stringify({
        current: {
            temperature_2m: 21.4,
            relative_humidity_2m: 60,
            precipitation: 0,
            wind_speed_10m: 12.3,
            weather_code: weatherCode,
        },
    });

describe('/api/weather', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    // Regression for SDD-001: icons disappeared because imageUrl was hardcoded to undefined
    it('maps the WMO weather code to a local icon url', async () => {
        fetchMock.mockResponseOnce(GEO_FIXTURE).mockResponseOnce(forecastFixture(3));
        const res = createMockResponse();

        await handler({ method: 'GET', query: { cities: 'limerick' }, headers: {} } as unknown as NextApiRequest, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([
            expect.objectContaining({
                city: 'limerick',
                name: 'Overcast',
                grades: '21',
                imageUrl: '/weather/cloud.svg',
            }),
        ]);
    });

    it('leaves imageUrl undefined for unknown weather codes', async () => {
        fetchMock.mockResponseOnce(GEO_FIXTURE).mockResponseOnce(forecastFixture(42));
        const res = createMockResponse();

        await handler({ method: 'GET', query: { cities: 'limerick' }, headers: {} } as unknown as NextApiRequest, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ city: 'limerick', imageUrl: undefined })]);
    });
});
