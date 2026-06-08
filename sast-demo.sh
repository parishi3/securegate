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
  > /tmp/sast_output.json

echo "Scan complete. Results:"
echo ""

node -e "
const fs = require('fs');
const r = JSON.parse(fs.readFileSync('/tmp/sast_output.json', 'utf8'));
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

SAST_DATA=$(cat /tmp/sast_output.json)

curl -s -X POST http://localhost:4002/results \
  -H "Content-Type: application/json" \
  -d "{\"scanId\": \"abc123def456\", \"sastResults\": $SAST_DATA, \"prNumber\": \"42\", \"repo\": \"parishi3/test-repo\"}" \
  > /tmp/lambda2_output.json

node -e "
const fs = require('fs');
const r = JSON.parse(fs.readFileSync('/tmp/lambda2_output.json', 'utf8'));
console.log('Status:       ', r.status ? r.status.toUpperCase() : 'unknown');
console.log('Merge blocked:', r.blocked);
if (r.findings) {
  console.log('HIGH:         ', r.findings.high || 0);
  console.log('MEDIUM:       ', r.findings.medium || 0);
  console.log('LOW:          ', r.findings.low || 0);
}
"

echo ""
echo ">>> Check Lambda 2 terminal for full PR comment"
echo "=================================="
echo "   SAST Demo Complete"
echo "=================================="
