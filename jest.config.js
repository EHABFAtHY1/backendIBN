module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.ts', '**/tests/**/*.ts', '**/*.test.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/server.ts',
        '!src/swagger.ts',
        '!src/seed.ts',
    ],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: {
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        },
    },
    testTimeout: 30000,
    bail: 1,
    verbose: true,
};
