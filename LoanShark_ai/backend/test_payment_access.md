# PaymentAccess Negation Shield - Test Cases

## Test A: Should NOT Flag (Safe with Negations)

**Input**:
```
PAYMENT OPTIONS
Borrower may enroll in optional autopay for scheduled installments only.
Autopay may be cancelled at any time by the borrower.
Lender may not initiate withdrawals except for scheduled payments authorized by the borrower.
No continuous authorization is granted.
```

**Expected Output**:
```json
{
  "score": 0-10,
  "label": "Safe",
  "reasons": [],
  "highlights": [],
  "debug": {
    "has_continuous_debit": 0,
    "has_auto_debit": 0
  }
}
```

**Why**: Contains "no continuous authorization" and "may not initiate" - negation shield should prevent flagging.

---

## Test B: MUST Flag (Predatory with Positive Action)

**Input**:
```
PAYMENT AUTHORIZATION
Borrower authorizes Lender to initiate ACH debits from Borrower's bank account for all amounts due, including fees and penalties.
Lender may attempt multiple withdrawals until paid in full.
```

**Expected Output**:
```json
{
  "score": 50+,
  "label": "Caution" or "High Risk",
  "reasons": [
    "Lender can repeatedly debit your account, risking overdraft fees and loss of control."
  ],
  "highlights": [
    {
      "text": "authorizes Lender to initiate ACH debits...",
      "category": "PaymentAccess"
    }
  ],
  "debug": {
    "has_continuous_debit": 1,
    "has_auto_debit": 1
  }
}
```

**Why**: Contains positive lender action ("authorizes lender to initiate", "multiple withdrawals") with NO negations.

---

## Test C: Should NOT Flag (Optional Autopay)

**Input**:
```
ELECTRONIC PAYMENTS
Automatic payment is available as an optional convenience feature.
If borrower opts in, scheduled monthly installments will be processed on the due date.
Borrower can opt out at any time.
This does not authorize the lender to withdraw unscheduled amounts.
```

**Expected Output**:
```json
{
  "score": 0-5,
  "label": "Safe",
  "reasons": [],
  "highlights": [],
  "debug": {
    "has_continuous_debit": 0,
    "has_auto_debit": 0
  }
}
```

**Why**: Contains "optional", "can opt out", "does not authorize" - multiple negation signals.

---

## How to Test

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "YOUR_TEST_TEXT_HERE"}'
```

Check the response for:
1. `debug.has_continuous_debit` - should be 0 for safe, 1 for predatory
2. `debug.has_auto_debit` - should be 0 for safe, 1 for predatory
3. `reasons` - should NOT mention PaymentAccess for safe loans
4. `highlights` - should be empty or not contain PaymentAccess category for safe loans

---

## Implementation Details

### Negation Shield (Feature Detection)

Checks ±150 character context around any match for these negation words:
- "no continuous"
- "no blanket"
- "does not authorize"
- "not authorize"
- "may not initiate"
- "except for scheduled"
- "only scheduled"
- "optional autopay"
- "can cancel"
- "can opt out"
- "may revoke"

### Positive Action Signals (Highlight Extraction)

Only extracts highlights that contain positive lender action:
- "authorizes lender"
- "lender may"
- "initiate debit"
- "repeatedly debit"
- "multiple withdrawal"
- "until paid"

AND double-checks the snippet doesn't contain: "no", "not", "does not", "may not"
