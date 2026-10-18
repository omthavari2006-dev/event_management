const neo4j = require('neo4j-driver');
const env = require('./env');

const driver = neo4j.driver(
  env.NEO4J.URI,
  neo4j.auth.basic(env.NEO4J.USER, env.NEO4J.PASSWORD),
  {
    disableLosslessIntegers: true, // converts neo4j integers to JS numbers automatically
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000 // 120 seconds
  }
);

/**
 * Verifies Neo4j database connectivity
 */
async function verifyConnection() {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log(`🔌 Neo4j Connected successfully to: ${serverInfo.address} (${serverInfo.agent})`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Neo4j Connection Warning: ${err.message}`);
    console.warn('Backend server will start, but database operations may fail until Neo4j is available.');
    return false;
  }
}

/**
 * Returns a new Neo4j session
 */
function getSession(mode = neo4j.session.WRITE) {
  return driver.session({
    database: env.NEO4J.DATABASE,
    defaultAccessMode: mode
  });
}

/**
 * Executes a parameterized query in a single-shot session
 */
async function executeQuery(cypher, params = {}) {
  const session = getSession();
  try {
    const result = await session.run(cypher, params);
    return result;
  } finally {
    await session.close();
  }
}

/**
 * Executes work inside an explicit Managed Write Transaction (ACID)
 */
async function executeWriteTransaction(workFunction) {
  const session = getSession(neo4j.session.WRITE);
  try {
    return await session.executeWrite(workFunction);
  } finally {
    await session.close();
  }
}

/**
 * Executes work inside an explicit Managed Read Transaction
 */
async function executeReadTransaction(workFunction) {
  const session = getSession(neo4j.session.READ);
  try {
    return await session.executeRead(workFunction);
  } finally {
    await session.close();
  }
}

/**
 * Graceful close of Neo4j driver
 */
async function closeDriver() {
  await driver.close();
  console.log('Neo4j Driver connection closed.');
}

module.exports = {
  driver,
  getSession,
  executeQuery,
  executeWriteTransaction,
  executeReadTransaction,
  verifyConnection,
  closeDriver
};
