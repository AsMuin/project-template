import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsEslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    js.configs.recommended,
    reactHooks.configs.flat['recommended-latest'],
    reactRefresh.configs.recommended,
    reactPlugin.configs.flat.recommended,
    reactPlugin.configs.flat['jsx-runtime'],
    tsEslint.configs.recommended,
    {
        ignores: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.vscode/**', '**/.yarn/**', '**/build/**', '**/public/**']
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: { allowDefaultProject: ['.prettierrc.js'] },
                tsconfigRootDir: import.meta.dirname
            },
            globals: globals.browser
        },
        plugins: { prettier: prettierPlugin },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            'prettier/prettier': 'warn',
            'react-refresh/only-export-components': 'off',
            '@typescript-eslint/no-floating-promises': 'warn',
            '@typescript-eslint/await-thenable': 'warn',
            curly: 'error',
            'padding-line-between-statements': [
                'warn',
                { blankLine: 'always', prev: '*', next: 'return' }, // return 前必须空行
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' }, // 变量声明和其他语句之间强制空行
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }, // 连续的变量声明之间允许没有空行
                { blankLine: 'always', prev: ['block-like'], next: '*' }, // 块语句之后添加空行
                { blankLine: 'always', prev: '*', next: ['block-like'] }, // 块语句前添加空行
                { blankLine: 'always', prev: 'import', next: '*' }, // import语句后添加空行
                { blankLine: 'any', prev: 'import', next: 'import' } // import和import之间不需要空行
            ]
        },
        settings: { react: { version: 'detect' } }
    }
]);
