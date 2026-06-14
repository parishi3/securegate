import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Test User' }]);
});

app.post('/api/login', (req, res) => {
  res.json({ token: 'test-token' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




//test run
