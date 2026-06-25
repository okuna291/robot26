const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Read the HTML template once at startup
const template = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Root — no background color set
app.get('/', (req, res) => {
    res.send(template.replace('{{COLOR}}', 'white'));
});

// Color routes
const colors = ['red', 'green', 'blue'];

colors.forEach(color => {
    app.get(`/${color}`, (req, res) => {
        res.send(template.replace('{{COLOR}}', color));
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
