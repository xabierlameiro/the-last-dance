const { FlatCompat } = require('@eslint/eslintrc');
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      '**/stories.tsx',
      '**/*.stories.tsx',
      '**/__test__/**/*',
      '**/__tests__/**/*',
      '**/*.test.tsx',
      // Temporarily ignore components with react-intl issues
      'src/components/News/**',
      'src/components/Heating/**',
      'src/components/Weather/**',
      'src/components/Blog/ArticlePanel/**',
      'src/components/Blog/ViewCounter/**',
      'src/components/Blog/StarCounter/**',
      'src/components/IndexedCounter/**',
      'src/components/CryptoPrice/**',
      'src/components/Layout/Header/**',
      'src/components/DeploymentStatus/**',
      'src/components/RenderManager/**',
    ]
  }
];
