import bcrypt from 'bcryptjs';
import { initDb, execute } from './config/database.js';

async function seed() {
  await initDb();
  const hash = await bcrypt.hash('admin123', 10);
  execute('INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['admin', 'admin@dhiblawe.local', hash, 'super_admin']);
  const entryHash = await bcrypt.hash('entry123', 10);
  execute('INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['dataentry', 'data@dhiblawe.local', entryHash, 'data_entry']);
  const viewHash = await bcrypt.hash('view123', 10);
  execute('INSERT OR IGNORE INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['viewer', 'view@dhiblawe.local', viewHash, 'view_only']);

  execute('INSERT OR IGNORE INTO clients (name, address) VALUES (?, ?)', ['Nairobi Water Supply', 'Moi Avenue, Nairobi']);
  execute('INSERT OR IGNORE INTO clients (name, address) VALUES (?, ?)', ['Eastlands Residences', 'Eastleigh, Nairobi']);
  execute('INSERT OR IGNORE INTO clients (name, address) VALUES (?, ?)', ['Westlands Mall', 'Westlands, Nairobi']);

  execute('INSERT OR IGNORE INTO plate_numbers (plate, default_rate) VALUES (?, ?)', ['KCA 001T', 500]);
  execute('INSERT OR IGNORE INTO plate_numbers (plate, default_rate) VALUES (?, ?)', ['KCB 002T', 500]);
  execute('INSERT OR IGNORE INTO plate_numbers (plate, default_rate) VALUES (?, ?)', ['KCC 003T', 500]);

  console.log('Default users:');
  console.log('  admin@dhiblawe.local / admin123 (super_admin)');
  console.log('  data@dhiblawe.local / entry123 (data_entry)');
  console.log('  view@dhiblawe.local / view123 (view_only)');
  process.exit(0);
}

seed();
