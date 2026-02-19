# Quick Start: Running Tests

## One-Command Setup & Test

```bash
cd /home/clawd/Share/projects/cribbage-multiplayer-game

# Start services
docker-compose up -d

# Wait 60 seconds for services to be ready
sleep 60

# Run all tests
npx playwright test tests/e2e/playwright.config.js --reporter=html

# View HTML report
npx playwright show-report
```

---

## Commands Reference

### Install Test Framework
```bash
npm install --save-dev @playwright/test
```

### Run All Tests
```bash
npx playwright test tests/e2e/playwright.config.js
```

### Run Specific Test File
```bash
npx playwright test tests/e2e/tests/game-flow.spec.js
```

### Run Single Test
```bash
npx playwright test -g "Player can create account"
```

### Run Tests in Debug Mode
```bash
npx playwright test --debug
```

### Run Tests in UI Mode (Interactive)
```bash
npx playwright test --ui
```

### View Test Report
```bash
npx playwright show-report
```

### Show Test Traces
```bash
npx playwright show-trace trace.zip
```

---

## Expected Results

✅ **29 E2E tests** covering:
- Player creation & stats
- Game setup & joining
- Game mechanics (cards, pegging, scoring)
- Multiplayer synchronization
- Error handling & validation
- Real-time UI updates

---

## Troubleshooting

### Tests Can't Connect to Backend
```bash
# Make sure services are running
docker-compose ps

# If not running:
docker-compose up -d

# Wait 30-60 seconds for startup
sleep 60
```

### Port Already in Use
```bash
# Free up ports
docker-compose down

# Restart
docker-compose up -d
sleep 60
```

### Clear Test Data
```bash
# Reset database
docker-compose down -v
docker-compose up -d
sleep 60
```

### View Detailed Test Output
```bash
npx playwright test --reporter=verbose tests/e2e/playwright.config.js
```

---

## CI/CD Integration

See `SECURITY_AUDIT.md` for GitHub Actions example workflow.

---

## Test Files Structure

```
tests/
└── e2e/
    ├── playwright.config.js    # Configuration
    ├── fixtures.js             # Test fixtures & helpers
    └── tests/
        ├── game-flow.spec.js         # 8 tests (setup/joining)
        ├── game-mechanics.spec.js    # 10 tests (gameplay)
        └── multiplayer-and-errors.spec.js  # 11 tests (MP/errors)
```

---

**Test Suite Created:** Feb 2, 2026  
**Status:** ✅ Ready to Run
