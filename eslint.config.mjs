import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        plugins: {
            prettier: prettierPlugin,
            'react-hooks': reactHooksPlugin
        },
        rules: {
            ...reactHooksPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off',
            'prettier/prettier': 'warn',
            'padding-line-between-statements': [
                'warn',
                { blankLine: 'always', prev: '*', next: 'return' }, // return 前必须空行
                { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' }, // 变量声明和其他语句之间强制空行
                { blankLine: 'any', prev: ['const', 'let', 'var'], next: ['const', 'let', 'var'] }, // 连续的变量声明之间允许没有空行
                { blankLine: 'always', prev: ['block-like'], next: '*' }, // 块语句之后添加空行
                { blankLine: 'always', prev: '*', next: ['block-like'] }, // 块语句前添加空行
                { blankLine: 'always', prev: 'import', next: '*' }, // import语句后添加空行
                { blankLine: 'any', prev: 'import', next: 'import' }, // import和import之间不需要空行,
                { blankLine: 'always', prev: 'export', next: 'export' } //export之间需要隔行
            ]
        }
    }
];

export default eslintConfig;
