import Hapi from 'hapi';

const server = new Hapi.Server({
  host: '192.168.1.133',
  port: '8081',
  routes: {
    cors: { origin: 'ignore' },
  },
});

async function main() {
  await server.register([{
    plugin: require('.'),
    routes: { prefix: '/shifts' },
  }]);

  await server.start();

  console.info(`✅  API server is listening at ${server.info.uri.toLowerCase()}`);
}

main();
