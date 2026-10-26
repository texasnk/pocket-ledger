import { createApp } from './presentation/app.js';
import { createDatabase } from './db/client.js';

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? '127.0.0.1';
const database = createDatabase();
createApp(database).listen(port, host, () =>
  console.log(`API available at http://${host}:${port}`)
);
