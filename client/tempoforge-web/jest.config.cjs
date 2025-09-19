const config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '^/assets/(.*)$': '<rootDir>/src/__mocks__/fileMock.ts',
    '\.(css|less|sass|scss)$': 'identity-obj-proxy',
    '\.(mp3|wav|ogg)$': '<rootDir>/src/__mocks__/fileMock.ts',
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json', useESM: true }],
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/setupTests.ts',
  ],
};

module.exports = config;
