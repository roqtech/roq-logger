const defaults = require('./eslint-defaults');

module.exports = {
  root: true,
  extends: [...defaults.extends, 'plugin:@roq/backendConfig', 'plugin:@roq/commonConfig'],
  plugins: [...defaults.plugins, '@roq'],
  overrides: [
    {
      "files": ["src/utilities/**/*.ts"],
      "rules": {
        "@roq/filename-suffix-mismatch": "off"
      }
    }
  ],
  env: {
    ...defaults.env,
    node: true,
  },
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: './',
  },
  rules: {
    ...defaults.rules,
    '@typescript-eslint/naming-convention': [
      ...defaults.rules['@typescript-eslint/naming-convention'],
      { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
    ],
    '@roq/no-invalid-dirname': ['error', { casing: 'camelCased', allowedSeparator: 'none', noNumerics: true }],
    '@roq/no-use-deprecated-modules': ['warn', ['moment', 'request']],
    '@roq/no-use-global-module': [
      'warn',
      ['ConfigModule'], // list of precise global nestjs modules per project goes here
    ],
  },
  settings: {
    'roq-linter': {
      backendBasePath: 'src',
      backendTestsBasePath: 'test',
    },
  },
};
