// test-vulnerable.js
// Deliberately vulnerable JavaScript file for SecureGate SAST demo
// DO NOT use in production — this file exists only for testing purposes

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { exec, execSync } = require('child_process');

const app = express();
app.use(express.json());

// ==========================================
// 1. HARDCODED SECRETS
// ==========================================
const password = "admin123";
const apiKey = "sk-prod-abc123def456ghi789";
const secretKey = "mysupersecretkey1234567890abcdef";
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
const awsAccessKeyId = "AKIAIOSFODNN7EXAMPLE";
const stripeKey = "sk-live-abcdefghijklmnopqrstuvwx";
const githubToken = "ghp_abcdefghijklmnopqrstuvwxyz123456789";

// ==========================================
// 2. SQL INJECTION
// ==========================================
function getUser(db, userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

function searchUsers(db, searchTerm) {
  return db.query(`SELECT * FROM users WHERE name = '${searchTerm}'`);
}

function deleteUser(db, userId) {
  return db.query("DELETE FROM users WHERE id = " + userId);
}

// ==========================================
// 3. NOSQL INJECTION
// ==========================================
app.post('/login', async (req, res) => {
  const user = await db.collection('users').find(req.body);
  const result = await db.collection('users').findOne(req.query);
  await db.collection('users').updateOne(req.params);
  await db.collection('users').deleteOne(req.body);
});

// ==========================================
// 4. XSS - Cross Site Scripting
// ==========================================
app.get('/search', (req, res) => {
  const query = req.query.q;
  document.getElementById('results').innerHTML = query;
  document.write('<h1>' + query + '</h1>');
  element.insertAdjacentHTML('beforeend', query);
  const div = document.createElement('div');
  div.outerHTML = req.query.content;
});

// ==========================================
// 5. PATH TRAVERSAL
// ==========================================
app.get('/file', (req, res) => {
  const filename = req.query.filename;
  fs.readFile(req.query.path, 'utf8', (err, data) => res.send(data));
  fs.writeFileSync(req.body.filepath, req.body.content);
  const filePath = path.join('/uploads', req.params.filename);
  const secret = fs.readFileSync('../../../etc/passwd');
});

// ==========================================
// 6. INSECURE RANDOM
// ==========================================
function generateSessionToken() {
  return Math.random().toString(36);
}

function generatePassword() {
  return Math.random().toString(36).substring(2);
}

const sessionId = Math.random() * 1000000;
const authToken = Math.random().toString(36);

// ==========================================
// 7. SENSITIVE DATA LOGGING
// ==========================================
function loginUser(username, password) {
  console.log('Login attempt with password:', password);
  console.log('User token:', accessToken);
  console.log('API key used:', apiKey);
  console.log('Credit card number:', req.body.creditcard);
}

// ==========================================
// 8. INSECURE FUNCTIONS
// ==========================================
function runCode(userInput) {
  eval(userInput);
  exec(userInput);
  execSync(userInput);
  const fn = new Function('return ' + userInput);
  child_process.exec('ls ' + userInput);
}

// ==========================================
// 9. WEAK CRYPTOGRAPHY
// ==========================================
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

function weakHash(data) {
  return crypto.createHash('sha1').update(data).digest('hex');
}

const cipher = crypto.createCipher('des', 'key');
const decipher = crypto.createDecipher('rc4', 'key');

// ==========================================
// 10. HARDCODED IP
// ==========================================
const DATABASE_HOST = "192.168.1.100";
const INTERNAL_API = "10.0.0.50:8080";
const REDIS_HOST = "172.16.0.10";

// ==========================================
// 11. OPEN REDIRECT
// ==========================================
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url);
  res.redirect(req.body.returnUrl);
  window.location = req.query.next;
});

// ==========================================
// 12. PROTOTYPE POLLUTION
// ==========================================
function merge(target, source) {
  target.__proto__ = source;
  Object.assign(target, req.body);
  target['__proto__']['admin'] = true;
  target.constructor.prototype.isAdmin = true;
}

// ==========================================
// 13. SSRF - Server Side Request Forgery
// ==========================================
app.post('/fetch', async (req, res) => {
  const data = await fetch(req.body.url);
  const result = await axios.get(req.query.endpoint);
  http.get(req.params.target, (response) => {});
  const response = await fetch('https://api.example.com/' + req.body.path);
});

// ==========================================
// 14. INSECURE COOKIE
// ==========================================
app.post('/session', (req, res) => {
  res.cookie('session', token);
  res.cookie('auth', userId, { httpOnly: false });
  document.cookie = 'token=' + authToken;
  res.cookie('user', data, { secure: false, sameSite: 'none' });
});

// ==========================================
// 15. SECURITY TODOS
// ==========================================
// TODO: security - add authentication here
// FIXME: security vulnerability - user input not sanitized
// HACK: bypassing auth check for now
// XXX: security - this token should not be hardcoded

app.listen(3000);
