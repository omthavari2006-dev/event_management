/**
 * Campus Event Management System - Neo4j Automated Database Seeder
 * Connects to Neo4j (Local or AuraDB) and runs constraints, indexes, and sample data.
 */

const fs = require('fs');
const path = require('path');
let neo4j, dotenv;
try {
  neo4j = require('neo4j-driver');
} catch (e) {
  neo4j = require('../backend/node_modules/neo4j-driver');
}

try {
  dotenv = require('dotenv');
} catch (e) {
  dotenv = require('../backend/node_modules/dotenv');
}

// Load environment variables from backend/.env or root .env
const envPath = fs.existsSync(path.join(__dirname, '../backend/.env'))
  ? path.join(__dirname, '../backend/.env')
  : path.join(__dirname, '../.env');

dotenv.config({ path: envPath });

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'campuspassword123';
const database = process.env.NEO4J_DATABASE || 'neo4j';

console.log('====================================================');
console.log('🚀 Campus Event Management System - Database Seeder');
console.log('====================================================');
console.log(`Connecting to Neo4j at: ${uri}`);
console.log(`User: ${user}`);

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
  disableLosslessIntegers: true
});

// Helper to parse multiple cypher statements separated by semicolons
function splitStatements(fileContent) {
  return fileContent
    .split(/;\s*[\r\n]+/)
    .map(stmt => {
      // Remove single-line comments
      return stmt
        .split('\n')
        .filter(line => !line.trim().startsWith('//'))
        .join('\n')
        .trim();
    })
    .filter(stmt => stmt.length > 0);
}

async function runCypherFile(session, filePath, fileDescription) {
  console.log(`\n📄 Executing: ${fileDescription} (${path.basename(filePath)})...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const statements = splitStatements(content);

  let successCount = 0;
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await session.run(stmt);
      successCount++;
    } catch (err) {
      // Some constraints might already exist, ignore if already exists or log warning
      if (err.message && (err.message.includes('already exists') || err.message.includes('An equivalent constraint'))) {
        // already exists, fine
      } else {
        console.warn(`⚠️ Warning executing statement ${i + 1}: ${err.message}`);
      }
    }
  }
  console.log(`✅ Completed ${successCount}/${statements.length} statements for ${fileDescription}`);
}

async function verifyCounts(session) {
  console.log('\n📊 Verifying Graph Database Entity Counts:');
  console.log('----------------------------------------------------');
  
  const labels = ['Admin', 'Student', 'Club', 'Event', 'Team', 'Certificate', 'Notification'];
  for (const label of labels) {
    try {
      const res = await session.run(`MATCH (n:${label}) RETURN count(n) AS count`);
      const count = res.records[0].get('count');
      console.log(`  🏷️  Node [${label.padEnd(14)}]: ${count}`);
    } catch (e) {
      console.log(`  🏷️  Node [${label.padEnd(14)}]: Error counting (${e.message})`);
    }
  }

  const relQuery = `
    MATCH ()-[r]->()
    RETURN type(r) AS relType, count(r) AS count
    ORDER BY count DESC
  `;
  try {
    const relRes = await session.run(relQuery);
    console.log('\n🔗 Relationship Counts:');
    relRes.records.forEach(r => {
      console.log(`  ➡️  [:${r.get('relType').padEnd(18)}]: ${r.get('count')}`);
    });
  } catch (e) {
    console.log('  Relationship count error:', e.message);
  }
  console.log('----------------------------------------------------');
}

async function seed() {
  const session = driver.session({ database });
  try {
    // 1. Verify connectivity
    await driver.verifyConnectivity();
    console.log('🔌 Successfully connected to Neo4j instance!');

    // 2. Constraints and Indexes
    const constraintsPath = path.join(__dirname, '01_constraints_indexes.cypher');
    if (fs.existsSync(constraintsPath)) {
      await runCypherFile(session, constraintsPath, 'Constraints & Indexes');
    }

    // 3. Sample Data
    const sampleDataPath = path.join(__dirname, '02_sample_data.cypher');
    if (fs.existsSync(sampleDataPath)) {
      await runCypherFile(session, sampleDataPath, 'Sample Data');
    }

    // 4. Verification
    await verifyCounts(session);

    console.log('\n✨ Database baseline seeding finished successfully!');
    console.log('Clubs are ready. Create and sign in with your own Admin, Organizer, or Student accounts via the portal.');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (error.code === 'ServiceUnavailable') {
      console.error('\n💡 TIP: Please verify that Neo4j is running. If using Docker:');
      console.error('    docker-compose up -d');
      console.error('Or if using Neo4j AuraDB, verify your NEO4J_URI and credentials in backend/.env');
    }
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();
