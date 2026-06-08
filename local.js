const express = require('express');
const app = express();
app.use(express.json());

app.post('/scan', async (req, res) => {
  const { imageUri, prNumber, commitSha, repo } = req.body;

  if (!imageUri || !prNumber || !commitSha || !repo) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`\n=== SCAN REQUEST RECEIVED ===`);
  console.log(`Repo:      ${repo}`);
  console.log(`PR:        #${prNumber}`);
  console.log(`Commit:    ${commitSha}`);
  console.log(`Image:     ${imageUri}`);

  console.log(`\n[DynamoDB] Checking SHA cache for: ${commitSha}`);
  console.log(`[DynamoDB] Cache miss — proceeding with scan`);

  const scanRecord = {
    scanId: commitSha,
    imageUri,
    prNumber,
    repo,
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  console.log(`\n[DynamoDB] Writing scan record:`);
  console.log(JSON.stringify(scanRecord, null, 2));

  const sqsMessage = { scanId: commitSha, imageUri, prNumber, repo };
  console.log(`\n[SQS] Queuing message on securegate-sast-queue:`);
  console.log(JSON.stringify(sqsMessage, null, 2));

  res.json({ scanId: commitSha, status: 'queued', message: 'Scan queued successfully' });
});

app.listen(4001, () => {
  console.log('Lambda 1 (local) running on http://localhost:4001');
  console.log('POST /scan to trigger a scan\n');
});
