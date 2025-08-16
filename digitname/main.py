from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from datetime import datetime
import json
import os
import time

from .logs_api import router as logs_router
from .logging_utils import write_log_to_file

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
        with open(PORTFOLIO_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {"error": "Portfolio data not found"}

# Include logs router
app.include_router(logs_router)

# Basic HTTP request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = None
    try:
        response = await call_next(request)
        return response
    finally:
        duration_ms = int((time.time() - start) * 1000)
        entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": "info",
            "service": "api",
            "message": "HTTP request",
            "method": request.method,
            "path": request.url.path,
            "status": getattr(response, "status_code", None),
            "duration_ms": duration_ms,
        }
        write_log_to_file(entry)

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
