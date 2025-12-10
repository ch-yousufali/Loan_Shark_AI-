"""
LoanShark AI - FastAPI Backend
Predatory Loan Detection API
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from loanshark_ml import analyze_loan

# Initialize FastAPI app
app = FastAPI(
    title="LoanShark AI API",
    description="Predatory Loan Detection API using ML + Rule-based Hybrid Scoring",
    version="1.0.0",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class AnalyzeRequest(BaseModel):
    text: str

    class Config:
        json_schema_extra = {
            "example": {
                "text": "PAYDAY LOAN AGREEMENT\nLoan Amount: $300\nAPR: 520%\nService Fee: $25 per $100 borrowed\nTerm: 14 days\nBinding arbitration required."
            }
        }


class AnalyzeResponse(BaseModel):
    score: int
    label: str
    confidence: str
    reasons: list[str]
    highlights: list[dict]
    debug: Optional[dict] = None


# API Endpoints


@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "LoanShark AI",
        "version": "1.0.0",
        "endpoints": {"analyze": "/analyze", "docs": "/docs"},
    }


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_loan_endpoint(request: AnalyzeRequest):
    """
    Analyze a loan contract for predatory patterns.

    **Input**: Loan contract text (pasted or extracted from PDF/image)

    **Output**:
    - score: 0-100 predatory risk score
    - label: Safe / Caution / High Risk / Predatory
    - confidence: High / Medium / Low
    - reasons: List of top reasons for the score
    - highlights: Dangerous text snippets with categories
    - debug: Internal scores (rule_score, ml_score, ml_prob)
    """
    try:
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Text is too short. Please provide a valid loan contract.",
            )

        # Analyze the loan
        result = analyze_loan(request.text)

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.post("/analyze/file")
async def analyze_file_endpoint(file: UploadFile = File(...)):
    """
    Analyze a loan contract from an uploaded file.

    **Supported formats**: .txt files (PDF/image OCR to be added)
    """
    try:
        # Read file content
        content = await file.read()
        text = content.decode("utf-8")

        if len(text.strip()) < 10:
            raise HTTPException(
                status_code=400, detail="File content is too short or empty."
            )

        # Analyze the loan
        result = analyze_loan(text)

        return result

    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File encoding error. Please upload a plain text file.",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/health")
def health_check():
    """Detailed health check with model status."""
    from loanshark_ml import load_model_and_schema

    model, schema = load_model_and_schema()

    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "schema_loaded": schema is not None,
        "model_type": schema.get("model_type") if schema else None,
        "features_count": len(schema.get("feature_names", [])) if schema else 0,
    }


# Run the server
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes (disable in production)
    )
