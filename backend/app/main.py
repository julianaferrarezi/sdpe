from io import BytesIO
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .pipeline import analyze_csv

app = FastAPI(title="EDM + XAI Framework API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "EDM + XAI Framework API is running"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), target_column: str = Form("dropout")):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(400, "Please upload a .csv file.")
    raw = await file.read()
    if not raw:
        raise HTTPException(400, "The uploaded file is empty.")
    try:
        try:
            df = pd.read_csv(BytesIO(raw), encoding="utf-8")
        except UnicodeDecodeError:
            df = pd.read_csv(BytesIO(raw), encoding="latin-1")
        return analyze_csv(df, target_column.strip())
    except ValueError as exc:
        raise HTTPException(422, str(exc))
    except Exception as exc:
        print(f"Analysis error: {type(exc).__name__}: {exc}")
        raise HTTPException(500, "Analysis failed. Check the backend terminal for details.")
