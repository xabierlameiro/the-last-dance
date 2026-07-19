import fetchMock from 'jest-fetch-mock';
import handler from '../../pages/api/xrp';
import { createMockResponse, createRequest } from '../../__test__/apiMocks';

const request = createRequest();

describe('/api/xrp', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    it('marks a positive 24h change as Up and signs the percentage', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ ripple: { eur: 2.12345, eur_24h_change: 3.456 } }));
        const res = createMockResponse();

        await handler(request, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            price: 2.1235,
            todaySummary: 'Up',
            todayPorcentage: '+3.46%',
        });
    });

    // A negative change already carries its own '-', so no sign is prepended
    it('marks a negative 24h change as Down without doubling the sign', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ ripple: { eur: 1.5, eur_24h_change: -2.5 } }));
        const res = createMockResponse();

        await handler(request, res);

        expect(res.json).toHaveBeenCalledWith({
            price: 1.5,
            todaySummary: 'Down',
            todayPorcentage: '-2.50%',
        });
    });

    it('returns an error when CoinGecko responds with a failure status', async () => {
        fetchMock.mockResponseOnce('', { status: 503 });
        const res = createMockResponse();

        await handler(request, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('returns an error when the payload has no ripple entry', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({}));
        const res = createMockResponse();

        await handler(request, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
});
