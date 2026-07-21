import { initDb } from './config/database.js';

async function seed() {
  await initDb();
  console.log('Database initialized with default data.');
  console.log('Default users:');
  console.log('  admin@dhiblawe.local / admin123 (super_admin)');
  console.log('  data@dhiblawe.local / entry123 (data_entry)');
  console.log('  view@dhiblawe.local / view123 (view_only)');
  process.exit(0);
}

seed();
