import config from '@ofk/eslint-config-recommend';

export default config({
  extends: [
    {
      files: ['client/{root,routes}.*', 'client/routes/**'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          { allowedNames: ['clientAction', 'clientLoader'] },
        ],
        '@typescript-eslint/promise-function-async': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
  ],
  ignores: ['.react-router/', 'build/'],
  imports: {
    defaultExportFiles: ['client/{root,routes}.*', 'client/routes/**', 'server/index.ts'],
  },
});
