require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    // Test the connection by trying to query the database
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Get current tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('\nExisting tables:', tables);
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
