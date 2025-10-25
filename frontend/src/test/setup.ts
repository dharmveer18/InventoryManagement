import { expect, afterEach, afterAll, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { server } from './mocks/server';

// Extend expect with Testing Library matchers
expect.extend(matchers as any);

// Set up MSW
beforeAll(() => {
  // Start MSW server with warning for unhandled requests
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  // Reset handlers and cleanup after each test
  server.resetHandlers();
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  // Clean up MSW server
  server.close();
});