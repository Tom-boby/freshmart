const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
  const dbPath = path.join(process.cwd(), 'db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  const server = jsonServer.create();
  const router = jsonServer.router(db);
  const middlewares = jsonServer.defaults({ noCors: false });

  server.use(middlewares);
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });
  server.use('/api', router);
  server.use(router);

  server(req, res);
};
