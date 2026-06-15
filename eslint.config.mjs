// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginJsdoc from 'eslint-plugin-jsdoc';
import pluginPerfectionist from 'eslint-plugin-perfectionist';
import functional from 'eslint-plugin-functional';
import pluginUnicorn from 'eslint-plugin-unicorn';
import pluginSonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
    {
        ignores: ['node_modules', 'dist', '**/*.js', '**/*.d.ts', 'infra', 'migrations'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            functional,
            perfectionist: pluginPerfectionist,
            unicorn: pluginUnicorn,
            sonarjs: pluginSonarjs,
            jsdoc: pluginJsdoc,
        },
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    args: 'after-used',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/prefer-readonly': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                    fixStyle: 'separate-type-imports',
                },
            ],
            'functional/prefer-readonly-type': 'off',
            'functional/no-conditional-statements': 'off',
            'functional/no-return-void': 'off',
            'functional/immutable-data': 'warn',
            'functional/no-let': 'off',
            'functional/no-expression-statements': 'off',

            'perfectionist/sort-imports': [
                'error',
                {
                    type: 'natural',
                    order: 'asc',
                    groups: [
                        'builtin', // node:fs
                        'external', // @nestjs, rxjs
                        'internal', // @core, @shared
                        'parent', // ../
                        'sibling', // ./
                        'index', // index.ts
                        'type', // type imports
                    ],
                },
            ],
            'no-duplicate-imports': 'error',

            'unicorn/filename-case': [
                'error',
                {
                    case: 'kebabCase',
                    ignore: ['index.ts', '\\.d\\.ts$'],
                },
            ],
            'unicorn/prefer-node-protocol': 'error',
            'unicorn/no-array-method-this-argument': 'warn',
            'unicorn/prefer-structured-clone': 'error',
            'unicorn/no-useless-undefined': 'error',
            'unicorn/prefer-export-from': 'error',
            'unicorn/prefer-spread': 'warn',
            'unicorn/no-array-reduce': 'warn',
            'unicorn/no-array-push-push': 'warn',

            'sonarjs/cognitive-complexity': ['error', 15],
            'sonarjs/no-duplicate-string': ['warn', { threshold: 5 }],
            'sonarjs/no-identical-functions': 'error',
            'sonarjs/no-collapsible-if': 'error',
            'sonarjs/no-unused-collection': 'error',

            'jsdoc/require-description': ['warn', { descriptionStyle: 'body' }],
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-types': 'error',
            'jsdoc/require-param-type': 'error',
            'jsdoc/require-returns-type': 'error',

            eqeqeq: ['error', 'always'],
            curly: ['error', 'all'],
            'no-console': ['warn', { allow: ['warn', 'error'] }],
            'no-return-await': 'error',
            'require-await': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'prefer-template': 'error',
            'object-shorthand': 'error',
            'arrow-body-style': ['error', 'as-needed'],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/await-thenable': 'error',

            'no-restricted-syntax': [
                'error',
                {
                    selector: `ImportDeclaration[importKind=type] > ImportSpecifier[imported.name=/.*Dto/]`,
                    message:
                        'DTO с декораторами должны использовать обычный импорт, а не import type',
                },
                {
                    selector: `ImportDeclaration[importKind=type] > ImportSpecifier[imported.name=/.*Validation/]`,
                    message:
                        'Классы валидации должны использовать обычный импорт, а не import type',
                },
                {
                    selector: `ImportDeclaration[importKind=type] > ImportSpecifier[imported.name=/.*Entity/]`,
                    message:
                        'Entity с декораторами должны использовать обычный импорт, а не import type',
                },
                {
                    selector: 'WhileStatement',
                    message:
                        '⚠️ Цикл while может быть бесконечным. Используйте for или for...of с явным счётчиком',
                },
                {
                    selector: 'DoWhileStatement',
                    message: '⚠️ Цикл do-while сложнее читать. Используйте for или for...of',
                },
                {
                    selector: 'ForInStatement',
                    message: 'Цикл for-in включает прототип. Используйте Object.keys() + for...of',
                },
                {
                    selector: 'LabeledStatement',
                    message: 'Метки делают код нечитаемым. Используйте функции с return',
                },
                {
                    selector: 'SwitchStatement[cases.length>10]',
                    message: '⚠️ Switch с более чем 10 кейсами. Используйте Map или объект',
                },
                {
                    selector: 'SwitchStatement:not([cases.length<=5])',
                    message:
                        '⚠️ Большой switch statement. Рассмотрите использование Map или реестра стратегий',
                },
            ],
            'no-restricted-properties': [
                'error',
                {
                    object: 'Array',
                    property: 'pop',
                    message: 'Используйте slice/spread вместо pop',
                },
                {
                    object: 'Array',
                    property: 'splice',
                    message: 'Используйте filter/slice вместо splice',
                },
                {
                    object: 'Object',
                    property: 'assign',
                    message: 'Используйте spread оператор: {...obj, newProp} вместо Object.assign',
                },
            ],
        },
    },
    {
        files: ['infra/**/*.ts', '**/migrations/**/*.ts', '**/*.config.ts', 'libs/**/*.ts'],
        rules: {
            'functional/no-conditional-statements': 'off',
            'functional/immutable-data': 'off',
        },
    },
);
