/** @type {import("snowpack").SnowpackUserConfig } */
export default {
  mount: {
    public: { url: '/', static: true },
    src: { url: '/dist' },
  },
  env: {},
  plugins: [
    [
      '@snowpack/plugin-typescript',
      {},
      {
        /* Yarn PnP workaround: see https://www.npmjs.com/package/@snowpack/plugin-typescript */
        ...(process.versions.pnp ? { tsc: 'yarn pnpify tsc' } : {}),
      },
    ],
  ],
  routes: [],
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true,
    sourcemap: false,
  },
  packageOptions: {
    polyfillNode: true,
  },
  devOptions: {},
  buildOptions: {},
};
