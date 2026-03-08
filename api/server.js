const path = require('path');
const fs = require('fs');
const url = require('url');

function readDb() {
  const dbPath = path.join(__dirname, 'db.json');
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = url.parse(req.url, true);
  // Remove /api prefix to get the resource path
  const pathname = parsedUrl.pathname.replace(/^\/api\/?/, '/');
  const query = parsedUrl.query;
  const db = readDb();

  // Parse the path: /{resource} or /{resource}/{id}
  const parts = pathname.split('/').filter(Boolean);
  const resource = parts[0]; // e.g., 'products', 'users', 'orders', etc.
  const id = parts[1] ? parseInt(parts[1]) : null;

  if (!resource || !db[resource]) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(404).json({ error: 'Resource not found', available: Object.keys(db) });
  }

  let data = db[resource];

  if (req.method === 'GET') {
    if (id) {
      // GET /api/resource/:id
      const item = data.find(item => item.id === id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).json(item);
    }

    // GET /api/resource?key=value — apply query filters
    if (Object.keys(query).length > 0) {
      data = data.filter(item => {
        return Object.entries(query).every(([key, value]) => {
          if (item[key] === undefined) return true;
          // Handle boolean and number comparisons
          if (typeof item[key] === 'boolean') {
            return item[key] === (value === 'true');
          }
          if (typeof item[key] === 'number') {
            return item[key] === Number(value);
          }
          return String(item[key]).toLowerCase() === String(value).toLowerCase();
        });
      });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    // For POST, read the body and return the new item with an ID
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);
        const maxId = data.reduce((max, item) => Math.max(max, item.id || 0), 0);
        newItem.id = maxId + 1;
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json(newItem);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    });
    return;
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!id) {
      return res.status(400).json({ error: 'ID required for update' });
    }
    const item = data.find(item => item.id === id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const updates = JSON.parse(body);
        const updated = { ...item, ...updates, id };
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(updated);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    });
    return;
  }

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'ID required for delete' });
    }
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({});
  }

  res.status(405).json({ error: 'Method not allowed' });
};
