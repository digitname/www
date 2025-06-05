from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import json
import os

app = FastAPI(title="Digitname API",
             description="API for serving portfolio data",
             version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = Path(__file__).parent.parent / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Load portfolio data
PORTFOLIO_FILE = Path(__file__).parent.parent / "portfolio" / "portfolio.json"

def load_portfolio():
    try:
        with open(PORTOLIO_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Portfolio data not found"}

@app.get("/api/portfolio")
async def get_portfolio():
    """Get all portfolio data"""
    return load_portfolio()

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
