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
            'prettier/prettier': 'warn',
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
        }
    }
];
