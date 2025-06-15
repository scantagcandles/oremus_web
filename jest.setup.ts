import '@testing-library/jest-dom';
import { beforeAll, afterAll } from '@jest/globals';

// Set up window.location for tests
declare global {
  var window: {
    location: {
      href: string;
      assign: jest.Mock;
      [key: string]: any;
    };
  };
}

const mockWindow = {
  location: {
    href: '',
    assign: jest.fn(),
    replace: jest.fn()
  }
};

beforeAll(() => {
  Object.defineProperty(global, 'window', { value: mockWindow, writable: true });
});

afterAll(() => {
  jest.clearAllMocks();
});
