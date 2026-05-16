import '@testing-library/jest-dom';
import React from 'react';

// Mock next/image to render a simple img for tests
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => React.createElement('img', props)
}));
