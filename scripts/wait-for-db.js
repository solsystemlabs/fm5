#!/usr/bin/env node

import pkg from 'pg';
const { Client } = pkg;

const config = {
  host: 'localhost',
  port: 5432,
  database: 'fm5_dev',
  user: 'fm5_user',
  password: 'fm5_password',
};

async function waitForDatabase() {
  const maxRetries = 30; // 30 seconds max wait
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const client = new Client(config);
      await client.connect();
      await client.query('SELECT 1');
      await client.end();
      
      console.log('✅ Database is ready!');
      return;
    } catch (error) {
      retries++;
      console.log(`⏳ Waiting for database... (${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.error('❌ Database failed to become ready within 30 seconds');
  process.exit(1);
}

waitForDatabase();