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

    /**
     * SDD-L07, criterion 4. A total upstream failure used to answer **200 with `[]`**: the client saw
     * neither an error nor a loading state, so the widget rendered nothing and read as a styling bug.
     */
    it('returns 502 when every upstream call fails', async () => {
        fetchMock.mockReject(new Error('network down'));
        const res = createMockResponse();

        await handler(
            { method: 'GET', query: { cities: 'limerick,vigo' }, headers: {} } as unknown as NextApiRequest,
            res
        );

        expect(res.status).toHaveBeenCalledWith(502);
        expect(res.json).toHaveBeenCalledWith({ error: 'Weather service unavailable' });
    });

    // One unreachable city must not blank the others.
    //
    // Dispatched by URL rather than by call order: the two cities are fetched concurrently through
    // `Promise.allSettled`, so both geocoding requests go out before either forecast and a queue of
    // `mockResponseOnce` calls lands on the wrong city.
    it('still answers 200 with the cities that did resolve', async () => {
        fetchMock.mockResponse(async (request) => {
            if (request.url.includes('vigo')) throw new Error('network down');
            if (request.url.includes('geocoding-api')) return GEO_FIXTURE;
            return forecastFixture(3);
        });
        const res = createMockResponse();

        await handler(
            { method: 'GET', query: { cities: 'limerick,vigo' }, headers: {} } as unknown as NextApiRequest,
            res
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ city: 'limerick' })]);
    });

    // The geocoding response was taken with `as GeocodingResponse` and never checked.
    it('fails when the geocoding response no longer matches its shape', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ results: [{ latitude: '52.66', longitude: -8.63, name: 'x' }] }));
        const res = createMockResponse();

        await handler({ method: 'GET', query: { cities: 'limerick' }, headers: {} } as unknown as NextApiRequest, res);

        expect(res.status).toHaveBeenCalledWith(502);
    });
});
