import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,cjs,ts}'],
        languageOptions: { globals: globals.node },
        plugins: {
            prettier: prettierPlugin
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'prettier/prettier': 'warn'
        }
    }
];
