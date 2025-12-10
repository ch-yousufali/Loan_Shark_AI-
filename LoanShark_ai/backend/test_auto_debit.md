# Test Auto-Debit Detection

## Test Cases

### Should NOT trigger (Safe - optional autopay):

```
Personal Loan Agreement
Loan Amount: $5,000
APR: 12%
Term: 24 months
Monthly Payment: $235

Automatic payment enrollment is optional. You may elect to set up autopay for convenience.
```

**Expected**:
- `has_auto_debit`: 0
- Label: Safe
- No auto-debit reason
- No auto-debit highlight

---

### Should trigger (Predatory - forced authorization):

```
Payday Loan Agreement
Loan Amount: $300
APR: 520%
Term: 14 days

By signing below, you authorize the lender to debit your bank account on the due date and any subsequent dates until the loan is paid in full.
```

**Expected**:
- `has_auto_debit`: 1
- Label: Predatory
- Reason: "Automatic debit authorization may make it difficult to manage payments."
- Highlight: "authorize the lender to debit your bank account..."

---

## How to Test

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "YOUR_TEST_TEXT_HERE"}'
```

Check the response for:
1. `debug.rule_score` - should be low for safe, high for predatory
2. `reasons` - should NOT mention auto-debit for safe loan
3. `highlights` - should be empty for safe loan
