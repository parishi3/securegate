# SecureGate — Demo Setup Guide

## Architecture
SecureGate automatically scans every GitHub PR for vulnerabilities and blocks merges on critical findings.

**Application layer (Parishi):** Lambda 1, Severity Check Lambda, Lambda 2, SAST container, Pentest container

**Infrastructure layer (Prachit):** Terraform, VPC, ECS, SQS, DynamoDB, API Gateway, ECR

---

## Quick Start — Run the Demo Locally

### Prerequisites
- Node.js 18+
- Docker Desktop running

### Step 1 — Clone and install
```bash
git clone git@github.com:parishi3/securegate.git
cd securegate
npm install
cd sast/backend && npm install && cd ../..
cd pentest/backend && npm install && cd ../..
```

### Step 2 — Open 6 terminals

**Terminal 1 — SAST server:**
```bash
cd ~/securegate-app/sast/backend && npm start
```

**Terminal 2 — Lambda 1:**
```bash
cd ~/securegate-app && node lambda1.js
```

**Terminal 3 — Lambda 2:**
```bash
cd ~/securegate-app && node lambda2.js
```

**Terminal 4 — Pentest target:**
```bash
cd ~/securegate-app && node pentest-target.js
```

**Terminal 5 — Pentest server:**
```bash
cd ~/securegate-app/pentest/backend && PORT=3001 node server.js
```

**Terminal 6 — Run demo scripts**

---

## Demo Scripts

### SAST Demo
```bash
chmod +x sast-demo.sh
./sast-demo.sh
```
Shows: SAST scan → Lambda 1 trigger → Lambda 2 PR comment → merge blocked

### Pentest Demo
```bash
chmod +x pentest-demo.sh
./pentest-demo.sh
```
Shows: 9 security tests → CORS misconfiguration → JWT weakness → dangerous HTTP methods

---

## Test Files

| File | Purpose |
|---|---|
| `test-vulnerable.js` | Triggers all 14 SAST vulnerability types |
| `pentest-target.js` | Vulnerable API exposing all 9 pentest weaknesses |

---

## SAST — 14 Vulnerability Types Detected

| ID | Name | Severity |
|---|---|---|
| HARDCODED_SECRET | Hardcoded secrets, API keys, tokens | HIGH |
| SQL_INJECTION | SQL injection via string concatenation | HIGH |
| NOSQL_INJECTION | MongoDB injection via user input | HIGH |
| XSS | Cross-site scripting vulnerabilities | HIGH |
| PATH_TRAVERSAL | File path traversal attacks | HIGH |
| INSECURE_FUNCTION | eval, exec, new Function usage | HIGH |
| SSRF | Server-side request forgery | HIGH |
| PROTOTYPE_POLLUTION | Object prototype manipulation | HIGH |
| INSECURE_RANDOM | Math.random() for security values | MEDIUM |
| SENSITIVE_DATA_LOG | Passwords/tokens logged to console | MEDIUM |
| WEAK_CRYPTO | MD5, SHA1, deprecated cipher usage | MEDIUM |
| HARDCODED_IP | IP addresses hardcoded in code | MEDIUM |
| OPEN_REDIRECT | Unvalidated redirect URLs | MEDIUM |
| INSECURE_COOKIE | Missing httpOnly, secure, sameSite flags | MEDIUM |
| SECURITY_TODO | Unresolved security TODOs in comments | LOW |

---

## Pentest — 9 Security Tests

| ID | Name | Severity |
|---|---|---|
| AUTH_MISSING | Endpoint accessible without authentication | HIGH |
| SQL_INJECTION | SQL injection via query parameters | HIGH |
| NOSQL_INJECTION | NoSQL injection via request body | HIGH |
| SENSITIVE_DATA_EXPOSURE | Secrets exposed in responses and errors | HIGH |
| JWT_WEAKNESS | Server accepts unsigned alg:none tokens | HIGH |
| CORS_MISCONFIGURATION | Wildcard CORS with credentials enabled | HIGH |
| RATE_LIMITING | No protection against brute force | MEDIUM |
| SECURITY_HEADERS | Missing X-Frame-Options, CSP, HSTS etc | MEDIUM |
| HTTP_METHODS | TRACE, DELETE, PUT methods enabled | MEDIUM |

---

## AWS Architecture (Production)
### AWS Services Used

| Service | Purpose |
|---|---|
| API Gateway | Public HTTPS endpoint receiving scan requests |
| Lambda × 3 | Trigger, severity check, results |
| SQS × 2 | SAST queue and pentest queue with DLQ |
| ECS Fargate | SAST and pentest worker containers |
| ECR | Docker image registry with native CVE scanning |
| DynamoDB | Scan results, SHA cache, config table |
| S3 | Full JSON and HTML scan reports |
| Secrets Manager | GitHub token storage |
| CloudWatch | Logs, alarms, monitoring |
| SNS | Failure notifications to email and Slack |
| EventBridge | Watches for failed ECS tasks |

**Estimated cost:** ~$1.50/month at class scale
