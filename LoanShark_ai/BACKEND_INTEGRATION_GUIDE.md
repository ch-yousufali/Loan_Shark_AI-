# Backend Integration Guide for Frontend Developer

## 🎯 Quick Start

**Backend is READY!** Here's everything you need to integrate.

---

## 📡 API Endpoint

**Base URL**: `http://localhost:8000`

**Main Endpoint**: `POST /analyze`

**Swagger Docs**: `http://localhost:8000/docs` (interactive testing)

---

## 🔌 API Request

### Endpoint
```
POST http://localhost:8000/analyze
Content-Type: application/json
```

### Request Body
```json
{
  "text": "LOAN CONTRACT TEXT HERE..."
}
```

**Example**:
```javascript
const response = await fetch('http://localhost:8000/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: userInputText
  })
});

const result = await response.json();
```

---

## 📦 API Response Format

```json
{
  "score": 85,
  "label": "Predatory",
  "confidence": "High",
  "reasons": [
    "APR is 520%, which is extremely high and predatory.",
    "Fees charged per $100 borrowed compound quickly on short-term loans.",
    "Loan includes rollover/renewal clauses that trap borrowers in debt cycles.",
    "Mandatory arbitration + class action waiver severely limits your legal rights.",
    "Very short repayment term (14 days or less) makes it difficult to repay."
  ],
  "highlights": [
    {
      "text": "APR: 520%",
      "category": "ExcessiveCost"
    },
    {
      "text": "$25 per $100 borrowed every 14 days",
      "category": "ExcessiveCost"
    },
    {
      "text": "automatically renew if unpaid",
      "category": "DebtCycle"
    },
    {
      "text": "binding arbitration required",
      "category": "LegalTrap"
    }
  ],
  "debug": {
    "rule_score": 88,
    "ml_score": 79,
    "ml_prob": 0.79
  }
}
```

---

## 🎨 Response Fields Explained

### `score` (integer, 0-100)
- **0-20**: Safe loan
- **21-50**: Caution (some concerns)
- **51-80**: High Risk (multiple red flags)
- **81-100**: Predatory (extremely dangerous)

**UI Suggestion**: Use color gradient (green → yellow → orange → red)

---

### `label` (string)
- `"Safe"` - Green badge
- `"Caution"` - Yellow badge
- `"High Risk"` - Orange badge
- `"Predatory"` - Red badge

**UI Suggestion**: Large, prominent badge at top of results

---

### `confidence` (string)
- `"High"` - We're confident in the analysis
- `"Medium"` - Some information missing, but reasonable
- `"Low"` - Very short text or missing critical info

**UI Suggestion**: Small indicator near score (e.g., "Confidence: High ✓")

---

### `reasons` (array of strings)
- Top 5 most important reasons for the score
- Ordered by priority (most important first)
- Plain English explanations

**UI Suggestion**: 
- Numbered list or bullet points
- Use icons (⚠️ for warnings, 🚨 for critical)
- Make them scannable

---

### `highlights` (array of objects)
Each highlight has:
- `text`: The actual snippet from the contract
- `category`: Type of issue

**Categories**:
- `"ExcessiveCost"` - High APR, fees
- `"LegalTrap"` - Arbitration, waivers
- `"DebtCycle"` - Rollovers, renewals
- `"PaymentAccess"` - Auto-debit, continuous authorization
- `"Collection"` - Employer contact, wage assignment

**UI Suggestion**:
- Show highlighted snippets in colored boxes
- Use category-specific colors:
  - ExcessiveCost: Red/Orange
  - LegalTrap: Dark Red
  - DebtCycle: Orange
  - PaymentAccess: Yellow/Orange
  - Collection: Red
- Add category labels/badges

---

### `debug` (object) - OPTIONAL
- `rule_score`: Score from rule-based detection
- `ml_score`: Score from ML model
- `ml_prob`: ML probability (0-1)

**UI Suggestion**: Hide by default, show in "Advanced" section or dev mode

---

## 🎯 Example UI Flow

### 1. Input Screen
```
┌─────────────────────────────────────┐
│  Paste your loan contract below:   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │                               │ │
│  │  [Large text area]            │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│     [Analyze Contract] Button       │
└─────────────────────────────────────┘
```

### 2. Loading State
```
┌─────────────────────────────────────┐
│   Analyzing your contract...        │
│   🔍 [Loading spinner]              │
└─────────────────────────────────────┘
```

### 3. Results Screen
```
┌─────────────────────────────────────┐
│  Risk Score: 85/100                 │
│  [████████████████░░] PREDATORY 🚨  │
│  Confidence: High ✓                 │
├─────────────────────────────────────┤
│  Why is this risky?                 │
│  1. APR is 520%, extremely high...  │
│  2. Fees per $100 compound quickly  │
│  3. Rollover clauses trap borrowers │
│  4. Arbitration limits your rights  │
│  5. Very short 14-day term          │
├─────────────────────────────────────┤
│  Dangerous Clauses Found:           │
│                                     │
│  💰 ExcessiveCost                   │
│  "APR: 520%"                        │
│                                     │
│  ⚖️ LegalTrap                       │
│  "binding arbitration required"     │
│                                     │
│  🔄 DebtCycle                       │
│  "automatically renew if unpaid"    │
└─────────────────────────────────────┘
```

---

## 🚨 Error Handling

### 400 Bad Request
```json
{
  "detail": "Text is too short. Please provide a valid loan contract."
}
```
 
**When**: Text < 10 characters

**UI Action**: Show error message, ask user to paste more text

---

### 500 Internal Server Error
```json
{
  "detail": "Analysis failed: [error message]"
}
```

**When**: Backend error (rare)

**UI Action**: Show friendly error, suggest trying again

---

## 🎨 Design Recommendations

### Color Palette
- **Safe (0-20)**: `#10B981` (Green)
- **Caution (21-50)**: `#F59E0B` (Amber)
- **High Risk (51-80)**: `#F97316` (Orange)
- **Predatory (81-100)**: `#EF4444` (Red)

### Typography
- **Score**: Large, bold (48px+)
- **Label**: Medium, uppercase (20px)
- **Reasons**: Regular (16px)
- **Highlights**: Monospace or code-style (14px)

### Icons
- ✅ Safe
- ⚠️ Caution
- 🔶 High Risk
- 🚨 Predatory

---

## 🧪 Test Cases for Frontend

### Test 1: Predatory Loan
```json
{
  "text": "Loan Amount: $300\nAPR: 520%\nService Fee: $25 per $100 borrowed\nTerm: 14 days\nLender may repeatedly debit your account until paid.\nBinding arbitration required."
}
```

**Expected**: Score 85+, Label "Predatory", 4-5 reasons, 3-4 highlights

---

### Test 2: Safe Loan
```json
{
  "text": "Personal Loan\nAmount: $5,000\nAPR: 12%\nTerm: 24 months\nMonthly Payment: $235\nNo prepayment penalty."
}
```

**Expected**: Score 0-10, Label "Safe", 0-1 reasons, 0 highlights

---

### Test 3: Short Text (Low Confidence)
```json
{
  "text": "APR: 36%"
}
```

**Expected**: Score low, Confidence "Low", minimal reasons

---

## 🔧 CORS & Deployment

**CORS is enabled** for all origins (development mode).

For production:
- Update `allow_origins` in `backend/main.py`
- Or use a proxy/nginx

---

## 📞 Health Check

```
GET http://localhost:8000/health
```

**Response**:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "schema_loaded": true,
  "model_type": "Logistic Regression",
  "features_count": 31
}
```

Use this to verify backend is running before showing UI.

---

## 🚀 Quick Integration Checklist

- [ ] Fetch from `POST /analyze` with user text
- [ ] Show loading state during analysis
- [ ] Display score with color gradient
- [ ] Show label badge (Safe/Caution/High Risk/Predatory)
- [ ] List reasons in priority order
- [ ] Display highlights with category colors
- [ ] Show confidence indicator
- [ ] Handle errors gracefully
- [ ] Test with sample contracts

---

## 💡 Pro Tips

1. **Debounce input**: Don't analyze on every keystroke
2. **Minimum length**: Warn if text < 50 characters
3. **Loading time**: Analysis takes ~500ms, show spinner
4. **Mobile-friendly**: Make sure highlights are readable on mobile
5. **Copy feature**: Let users copy highlights for reference
6. **Share results**: Consider adding share/export functionality

---

## 🎯 Priority Features

**Must Have**:
- Text input
- Score display
- Reasons list
- Highlights

**Nice to Have**:
- File upload (use `/analyze/file` endpoint)
- Export to PDF
- Comparison mode (analyze multiple contracts)
- History of analyzed contracts

---

## 📞 Questions?

Backend is running at: `http://localhost:8000`

Interactive docs: `http://localhost:8000/docs`

Test the API there first to see live examples!

**Good luck! The backend is solid and ready to go! 🚀**
