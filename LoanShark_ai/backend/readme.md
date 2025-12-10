# LoanShark AI - Backend API

FastAPI backend for predatory loan detection using ML + rule-based hybrid scoring.

## Quick Start

### 1. Activate Virtual Environment

```bash
cd backend
.\myenv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will start at: **http://localhost:8000**

## API Endpoints

### `GET /`
Health check and API info

### `POST /analyze`
Analyze loan contract text

**Request:**
```json
{
  "text": "PAYDAY LOAN AGREEMENT\nLoan Amount: $300\nAPR: 520%..."
}
```

**Response:**
```json
{
  "score": 85,
  "label": "Predatory",
  "confidence": "High",
  "reasons": [
    "APR is 520%, which is extremely high and predatory.",
    "Loan includes rollover/renewal clauses that trap borrowers."
  ],
  "highlights": [
    {"text": "APR: 520%", "category": "ExcessiveCost"}
  ],
  "debug": {
    "rule_score": 88,
    "ml_score": 79,
    "ml_prob": 0.79
  }
}
```

### `POST /analyze/file`
Upload and analyze a loan contract file (.txt)

### `GET /health`
Detailed health check with model status

### `GET /docs`
Interactive API documentation (Swagger UI)

## Testing

### Using cURL

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "PAYDAY LOAN AGREEMENT\nAPR: 520%\nTerm: 14 days"}'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/analyze",
    json={"text": "Your loan contract text here..."}
)

print(response.json())
```

### Using Browser

Visit **http://localhost:8000/docs** for interactive API testing

## Project Structure

```
backend/
├── main.py              # FastAPI application
├── loanshark_ml.py      # ML inference module
├── requirements.txt     # Dependencies
├── myenv/              # Virtual environment
└── README.md           # This file
```

## Dependencies

- **FastAPI**: Web framework
- **Uvicorn**: ASGI server
- **scikit-learn**: ML model
- **joblib**: Model loading
- **numpy, pandas**: Data processing

## CORS

CORS is enabled for all origins (development mode). For production, update `allow_origins` in `main.py` to specific frontend URLs.

## Next Steps

1. ✅ Backend API running
2. ⏭️ Build frontend UI
3. ⏭️ Connect frontend to this API
4. ⏭️ Add OCR for PDF/image support (optional)
5. ⏭️ Deploy for demo
