module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'simple-import-sort', 'import'],
    ignorePatterns: ['dist/'],
    rules: {
        'sort-imports': 'off',
        'prettier/prettier': ['error', { endOfLine: 'auto', tabWidth: 4, singleQuote: true, printWidth: 120 }],
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        'import/first': 'error',
        'import/newline-after-import': 'error',
        'import/no-duplicates': 'error',
    },
    overrides: [
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
