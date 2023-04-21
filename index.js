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
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return h.response({ status: true, text: 'success', message: 'server sukses berjalan', data: [] }).code(200);
    }
  });

  server.route({
    method: 'POST',
    path: '/pelaporan/add',
    options: {
      validate: {
        failAction: async (request, h, err) => {
          if (process.env.NODE_ENV === 'production') {
            // In prod, log a limited error message and throw the default Bad Request error.
            console.error('ValidationError:', err.message);
            throw Boom.badRequest(`Invalid request payload input`);
          } else {
            // During development, log and respond with the full error.
            console.error(err);
            throw err;
          }
        },
        payload: pelaporanScheme,
      },
    },
    handler: pelaporanAdd,
  });

  await server.start();

  console.log(`Server started at ${server.info.uri}`);
};

main();
