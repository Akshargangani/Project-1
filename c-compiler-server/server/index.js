import express from 'express';
import cors from 'cors';

import { runC } from './compiler/interpreter.js';

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/samples', (req, res) => {
  res.json({
    hello: `#include <stdio.h>
int main() {
  printf("Hello World");
  return 0;
}`
  });
});

app.post('/api/run', (req, res) => {
  const { source } = req.body;
  try {
    const result = runC(source);
    res.json(result);
  } catch (err) {
    res.json({ ok: false, error: err.message || 'Unknown' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
