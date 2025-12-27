const express = require('express');
const path = require('path');
const app = express();
const buildPath = path.join(__dirname, 'build');

app.use(express.static(buildPath));

// Always return index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = 5050;
app.listen(port, () => {
  console.log(`SPA server running: http://localhost:${port}`);
});
