// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import functional from 'eslint-plugin-functional';

export default tseslint.config(
    {
        ignores: ['node_modules', 'dist', '**/*.js', '**/*.d.ts', 'infra', 'migrations'],
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            functional,
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
