import app from './app.js';
import { initDb } from './config/database.js';
import { PORT } from './config/env.js';

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Dhiblawe WaterFlow → http://localhost:${PORT}`);
  });
});
