#!/bin/bash

echo "=================================="
echo "   SecureGate — SAST Demo"
echo "=================================="
echo ""

echo ">>> Scanning vulnerable code with SAST tool..."
echo ""

curl -s -X POST http://localhost:3000/scan/code \
  -H "Content-Type: application/json" \
  -d "{\"code\": \"const password = 'admin123'; eval(userInput); const apiKey = 'sk-prod-abc123'; const query = 'SELECT * FROM users WHERE id = ' + userId;\"}" \
  -o ~/securegate-app/sast_output.json

echo "Scan complete. Results:"
echo ""

node -e "
const r = require('/c/Users/p4par/securegate-app/sast_output.json');
console.log('Total vulnerabilities:', r.summary.totalVulnerabilities);
console.log('HIGH:  ', r.summary.high);
console.log('MEDIUM:', r.summary.medium);
console.log('LOW:   ', r.summary.low);
console.log('');
console.log('Findings:');
r.vulnerabilities.forEach(v => {
  console.log(' -', v.severity, '|', v.name, '| line', v.line, '|', v.description);
});
"

echo ""
echo ">>> Feeding results into Lambda 1..."
echo ""

curl -s -X POST http://localhost:4001/scan \
  -H "Content-Type: application/json" \
  -d "{\"imageUri\": \"ecr.amazonaws.com/securegate-app:abc123\", \"prNumber\": \"42\", \"commitSha\": \"abc123def456\", \"repo\": \"parishi3/test-repo\"}"

echo ""
echo ""
echo ">>> Processing through Lambda 2 — generating PR comment..."
echo ""

curl -s -X POST http://localhost:4002/results \
  -H "Content-Type: application/json" \
  -d "{\"scanId\": \"abc123def456\", \"sastResults\": $(cat ~/securegate-app/sast_output.json), \"prNumber\": \"42\", \"repo\": \"parishi3/test-repo\"}" | node -e "
const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  const r = JSON.parse(chunks.join(''));
  console.log('Status:       ', r.status.toUpperCase());
  console.log('Merge blocked:', r.blocked);
  console.log('HIGH:         ', r.findings.high);
  console.log('MEDIUM:       ', r.findings.medium);
  console.log('LOW:          ', r.findings.low);
});
"

echo ""
echo ">>> Check Lambda 2 terminal for full PR comment"
echo "=================================="
echo "   SAST Demo Complete"
echo "=================================="
