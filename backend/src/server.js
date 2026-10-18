const app = require('./app');
const env = require('./config/env');
const { verifyConnection, closeDriver } = require('./config/db');

async function startServer() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting Campus Event Management Backend...');
  console.log('----------------------------------------------------');

  // Verify Neo4j connectivity
  await verifyConnection();

  const server = app.listen(env.PORT, () => {
    console.log(`📡 Server running on http://localhost:${env.PORT}`);
    console.log(`📚 REST API available at http://localhost:${env.PORT}/api`);
    console.log(`🌐 Target Frontend Client: ${env.CLIENT_URL}`);
    console.log('----------------------------------------------------');
  });

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await closeDriver();
      console.log('HTTP Server and Neo4j connections terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
