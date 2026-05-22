from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/cnc", tags=["cnc"])

# Simple in-memory state for CNC
cnc_state = {
    "status": "idle", # idle, drawing, paused
    "progress": 0.0,
    "current_line": 0,
    "total_lines": 0,
    "x": 0.0,
    "y": 0.0
}

class CNCProgressUpdate(BaseModel):
    progress: Optional[float] = None
    current_line: Optional[int] = None
    total_lines: Optional[int] = None
    x: Optional[float] = None
    y: Optional[float] = None

@router.post("/progress")
async def update_progress(update: CNCProgressUpdate):
    if update.progress is not None:
        cnc_state["progress"] = update.progress
    if update.current_line is not None:
        cnc_state["current_line"] = update.current_line
    if update.total_lines is not None:
        cnc_state["total_lines"] = update.total_lines
    if update.x is not None:
        cnc_state["x"] = update.x
    if update.y is not None:
        cnc_state["y"] = update.y

    # If the CNC is idle but sends progress, assume it's drawing
    if cnc_state["status"] == "idle" and cnc_state["current_line"] > 0:
        cnc_state["status"] = "drawing"

    return {"message": "Progress updated", "state": cnc_state}

@router.get("/status")
async def get_status():
    return cnc_state

@router.post("/pause")
async def pause_cnc():
    cnc_state["status"] = "paused"
    return {"message": "CNC paused", "state": cnc_state}

@router.post("/resume")
async def resume_cnc():
    if cnc_state["status"] == "paused":
        cnc_state["status"] = "drawing"
    return {"message": "CNC resumed", "state": cnc_state}

@router.post("/stop")
async def stop_cnc():
    cnc_state["status"] = "idle"
    cnc_state["progress"] = 0.0
    cnc_state["current_line"] = 0
    return {"message": "CNC stopped", "state": cnc_state}

