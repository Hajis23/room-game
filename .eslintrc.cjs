module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react', 'react-refresh'],
  settings: { react: { version: '18.2' } },
  ignorePatterns: ['vite.config.js'],
  rules: {
    'max-len': ['error', { code: 120 }],
    'no-console': 'off',
    'import/prefer-default-export': 'off',
    semi: 'off',
  },
};
