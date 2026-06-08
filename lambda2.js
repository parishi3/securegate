const express = require('express');
const app = express();
app.use(express.json());

function formatPRComment(scanId, findings, prNumber, repo) {
  const high = findings.filter(f => f.severity === 'HIGH').length;
  const medium = findings.filter(f => f.severity === 'MEDIUM').length;
  const low = findings.filter(f => f.severity === 'LOW').length;
  const blocked = high >= 3;

  const topFindings = findings.slice(0, 5).map(f =>
    `- **${f.id}** at line ${f.line || '?'}: ${f.message}`
  ).join('\n');

  return {
    blocked,
    comment: `## 🔒 SecureGate Security Scan Results

**Scan ID:** \`${scanId}\`
**Status:** ${blocked ? '🔴 FAILED — merge blocked' : '✅ PASSED — safe to merge'}

### SAST Results
| Severity | Count |
|----------|-------|
| 🔴 High  | ${high} |
| 🟡 Medium | ${medium} |
| 🟢 Low   | ${low} |

### Top Findings
${topFindings || 'No findings'}

${blocked ?
  '⛔ **This PR is blocked. Fix all HIGH severity issues before merging.**' :
  '✅ **This PR passed all security checks.**'
}`
  };
}

app.post('/results', async (req, res) => {
  const { scanId, sastResults, prNumber, repo } = req.body;

  console.log(`\n=== PROCESSING RESULTS ===`);
  console.log(`Scan ID: ${scanId}`);
  console.log(`PR:      #${prNumber}`);
  console.log(`Repo:    ${repo}`);

  const findings = sastResults?.vulnerabilities || [];
  const { blocked, comment } = formatPRComment(scanId, findings, prNumber, repo);

  console.log(`\n[Decision] ${blocked ? 'FAILED — merge blocked' : 'PASSED — safe to merge'}`);
  console.log(`\n=== PR COMMENT TO BE POSTED ===`);
  console.log(comment);
  console.log(`\n=== GITHUB STATUS CHECK ===`);
  console.log(`State: ${blocked ? 'failure' : 'success'}`);
  console.log(`Repo:  ${repo} PR: #${prNumber}`);
  console.log(`(In production this calls GitHub API using token from Secrets Manager)`);

  res.json({ scanId, status: blocked ? 'failed' : 'passed', blocked, comment });
});

app.listen(4002, () => {
  console.log('Lambda 2 (local) running on http://localhost:4002');
  console.log('POST /results to process scan results\n');
});
