import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import stylistic from '@stylistic/eslint-plugin';

const functionDeclaration = {
  selector:
    ':matches(FunctionDeclaration, VariableDeclaration:has(> VariableDeclarator > ArrowFunctionExpression), ExportNamedDeclaration:has(> FunctionDeclaration), ExportNamedDeclaration:has(> VariableDeclaration > VariableDeclarator > ArrowFunctionExpression))'
};

export default tseslint.config(
  { ignores: ['**/dist/**', '**/coverage/**', '**/node_modules/**', '**/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    plugins: { '@stylistic': stylistic },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: functionDeclaration, next: functionDeclaration }
      ]
    }
  },
  prettier
);
