# Testing & Performance

This folder contains scripts and documentation for testing the CTO Dashboard services.

## Performance Testing with k6

We use [k6](https://k6.io/) to simulate high-load scenarios.

### 1. Installation

#### Windows (Chocolatey)
```powershell
choco install k6
```

#### Windows (winget)
```powershell
winget install k6
```

#### Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### macOS (Homebrew)
```bash
brew install k6
```

### 2. Running the GitHub Webhook Load Test

The `github-webhook-load-test.js` script simulates an organization with 5,000 developers working across 40 repositories.

To run the test with the default localtunnel URL:
```bash
k6 run github-webhook-load-test.js
```
To run the test with 40 VUs and 1000 iterations:
```bash
k6 run --vus 1 --iterations 1 github-webhook-load-test.js
```

To run the test with 40 VUs and 1000 iterations:
```bash
k6 run --vus 40 --iterations 1000 github-webhook-load-test.js
```

To run with a custom URL:
```bash
k6 run -e BASE_URL=http://localhost:3000 github-webhook-load-test.js
```

## Manual Verification

See [curls.md](curls.md) for a list of sample `curl` commands for manual API testing.
