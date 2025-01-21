require('dotenv').config({ path: '.env.local' });
const { execSync } = require('child_process');

try {
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('Generating Prisma Client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    env: { ...process.env }
  });
} catch (error) {
  console.error('Database push failed:', error);
}
