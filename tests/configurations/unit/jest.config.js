module.exports = {
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
    testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
    collectCoverage: true,
    coveragePathIgnorePatterns: ['<rootDir>/tests/'],
    coverageReporters: ['text', 'html'],
    reporters: [
      'default',
      ['jest-html-reporters', { multipleReportsUnitePath: './reports', pageTitle: 'unit', publicPath: './reports', filename: 'unit.html' }],
    ],
    rootDir: '../../../.',
    setupFiles: ['<rootDir>/tests/configurations/jest.setup.js'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist/']
  };