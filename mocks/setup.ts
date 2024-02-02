import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';
import mocksMSW from '.';

const server = setupServer(...mocksMSW);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());
