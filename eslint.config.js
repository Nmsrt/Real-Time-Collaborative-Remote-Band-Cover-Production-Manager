import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist', 'build', 'node_modules', 'server/*.sqlite*'] },

  // Browser React source.
  {
    files: ['src/**/*.{js,jsx}'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }]
    }
  },

  // Node backend.
  {
    files: ['server/**/*.js', '*.config.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' }
    }
  }
];
