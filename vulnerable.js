const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const exec = require('child_process').exec;

const app = express();
app.use(express.json());

// HARDCODED SECRET — should be in env vars
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';
const JWT_SECRET = 'supersecretkey';

// SQL INJECTION — string concatenation in query
app.get('/user', (req, res) => {
  const userId = req.query.id;
  const query = 'SELECT * FROM users WHERE id = ' + userId;
  connection.query(query, (err, results) => {
    res.json(results);
  });
});

// COMMAND INJECTION — eval and exec with user input
app.post('/run', (req, res) => {
  const cmd = req.body.command;
  exec(cmd, (error, stdout) => {
    res.send(stdout);
  });
  eval(req.body.code);
});

// WEAK CRYPTO — MD5 and SHA1
app.post('/hash', (req, res) => {
  const hash1 = crypto.createHash('md5').update(req.body.data).digest('hex');
  const hash2 = crypto.createHash('sha1').update(req.body.data).digest('hex');
  res.json({ md5: hash1, sha1: hash2 });
});

// SENSITIVE DATA IN LOGS
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt: ' + username + ' password: ' + password);
  console.log('API Key used: ' + API_KEY);
});

// NOSQL INJECTION
app.get('/find', (req, res) => {
  const query = { username: req.query.username };
  db.collection('users').find(query).toArray((err, docs) => {
    res.json(docs);
  });
});

// WEAK RANDOMNESS — Math.random for security token
app.get('/token', (req, res) => {
  const token = Math.random().toString(36).substring(2);
  res.json({ token });
});

// PATH TRAVERSAL — unvalidated file path
app.get('/file', (req, res) => {
  const filename = req.query.name;
  res.sendFile('/uploads/' + filename);
});

// HARDCODED IP
const DB_HOST = '192.168.1.100';

app.listen(3000);
