const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'campus_event_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  NEO4J: {
    URI: process.env.NEO4J_URI || 'bolt://localhost:7687',
    USER: process.env.NEO4J_USER || 'neo4j',
    PASSWORD: process.env.NEO4J_PASSWORD || 'campuspassword123',
    DATABASE: process.env.NEO4J_DATABASE || 'neo4j'
  }
};
