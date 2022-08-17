/* eslint-disable no-console */
// const puppeteer = require('puppeteer');
const Hapi = require('@hapi/hapi');
const { pelaporanScheme } = require('./schemes/pelaporan_scheme');
const { pelaporanAdd } = require('./handlers/pelaporan_add');

const main = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
  });

  server.route({
    method: 'POST',
    path: '/pelaporan/add',
    options: {
      validate: {
        payload: pelaporanScheme,
      },
    },
    handler: pelaporanAdd,
  });

  await server.start();

  console.log(`Server started at ${server.info.uri}`);
};

main();
