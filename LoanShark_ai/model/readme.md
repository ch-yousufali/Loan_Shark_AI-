# LoanShark AI - ML Pipeline

## Quick Start

### 1. Install Dependencies

```bash
pip install scikit-learn xgboost joblib numpy pandas jupyter
```

If XGBoost installation fails, the notebook will automatically fall back to RandomForest.

### 2. Run the Notebook

```bash
cd model
jupyter notebook loanshark_ml_pipeline.ipynb
```

Or open it in VS Code with the Jupyter extension.

### 3. Execute All Cells

Run all cells in order (Cell → Run All). The notebook will:

1. ✓ Extract features from loan contracts (30+ features)
2. ✓ Load dataset (60 samples: 30 safe + 30 predatory)
3. ✓ Train models (Logistic Regression + XGBoost/RandomForest)
4. ✓ Evaluate and select best model
5. ✓ Save model to `models/loanshark_model.joblib`
6. ✓ Test on sample loans
7. ✓ Run calibration check on full dataset

**Expected runtime**: < 1 minute

### 4. Check Outputs

After running, you should have:

- `models/loanshark_model.joblib` - Trained ML model
- `models/feature_schema.json` - Feature names and metadata
- `models/training_report.txt` - Performance metrics

## What's Inside

The notebook contains:

### Feature Extraction (30+ features)
- **APR & Costs**: APR value, fees, cost patterns
- **Payment Terms**: Term length, payment frequency
- **Predatory Clauses**: Arbitration, rollovers, auto-debit, etc.
- **Transparency**: Disclosure language, borrower rights
- **Risk Ratios**: APR-to-term ratio (high APR + short term = extreme risk)

### Hybrid Scoring
- **Rule-based score** (0-100): Pattern matching for known predatory signals
- **ML score** (0-100): Trained model probability
- **Adaptive weighting**: Adjusts based on extraction quality
- **Hard floor rules**: Prevents ML from smoothing obvious predatory signals

### Output Format (API-ready)

```json
{
  "score": 85,
  "label": "Predatory",
  "confidence": "High",
  "reasons": [
    "APR is 520%, which is extremely high and predatory.",
    "Loan includes rollover/renewal clauses that trap borrowers.",
    "Mandatory arbitration + class action waiver limits your rights."
  ],
  "highlights": [
    {"text": "APR: 520%", "category": "ExcessiveCost"},
    {"text": "automatically renew if unpaid", "category": "DebtCycle"}
  ],
  "debug": {
    "rule_score": 88,
    "ml_score": 79,
    "ml_prob": 0.79
  }
}
```

## Integration with Backend

Once the model is trained, you can use it in your backend:

```python
# In your Flask/FastAPI backend
from loanshark_ml_pipeline import analyze_loan

@app.post("/analyze")
def analyze_endpoint(text: str):
    result = analyze_loan(text)
    return jsonify(result)
```

## Testing

The notebook includes:

1. **Sample Tests**: 2 predatory + 2 safe loans
2. **Calibration Test**: All 60 samples to verify accuracy
3. **Expected Accuracy**: > 95% on training data

## Troubleshooting

**XGBoost not installing?**
- The notebook will automatically use RandomForest instead
- Performance difference is minimal for this dataset

**Model accuracy too low?**
- Check dataset quality (all files readable?)
- Verify feature extraction is working (run test cell)
- May need to adjust hybrid weighting in scoring section

**Import errors?**
- Make sure you're in the `model` directory
- Install all dependencies: `pip install -r requirements.txt`

## Next Steps

1. ✅ Run the notebook to train the model
2. ⏭️ Copy the `analyze_loan()` function to your backend
3. ⏭️ Build the Flask/FastAPI endpoint
4. ⏭️ Connect frontend to backend API
5. ⏭️ Demo time! 🚀
