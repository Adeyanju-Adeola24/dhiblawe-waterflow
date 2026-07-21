import serverless from 'serverless-http';
import app from '../../server/src/app.js';
import { initDb } from '../../server/src/config/database.js';

let initialized = false;
const wrapped = serverless(app);

export async function handler(event, context) {
  if (!initialized) {
    await initDb();
    initialized = true;
  }
  return wrapped(event, context);
}
