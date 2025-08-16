from fastapi import APIRouter, Request, HTTPException
from typing import Any, Dict, List, Union
from time import time
from .logging_utils import sanitize_log_entry, write_log_to_file

router = APIRouter(prefix="/api", tags=["logs"])

# Simple in-memory rate limit per IP
RATE_LIMIT = 100  # requests per minute
RATE_LIMIT_WINDOW = 60.0  # seconds
_request_times: Dict[str, List[float]] = {}


def _allow_request(ip: str) -> bool:
    now = time()
    bucket = _request_times.get(ip, [])
    # drop old
    bucket = [t for t in bucket if now - t < RATE_LIMIT_WINDOW]
    if len(bucket) >= RATE_LIMIT:
        _request_times[ip] = bucket
        return False
    bucket.append(now)
    _request_times[ip] = bucket
    return True


@router.post("/logs")
async def receive_logs(request: Request, body: Union[List[Dict[str, Any]], Dict[str, Any]]):
    client_ip = request.client.host if request.client else "unknown"
    if not _allow_request(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please try again later.")

    # Normalize to list
    entries = body if isinstance(body, list) else [body]

    processed = 0
    for entry in entries:
        sanitized = sanitize_log_entry(entry)
        write_log_to_file(sanitized)
        processed += 1

    return {"status": "success", "processed": processed}
