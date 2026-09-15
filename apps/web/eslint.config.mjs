import next from 'eslint-config-next';

const config = [
  { ignores: ['.next/**', 'node_modules/**', 'dist/**'] },
  ...next,
];

export default config;
