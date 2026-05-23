from fastapi import APIRouter
from app.models.job import Job
from app.core.database import jobs_collection
from bson.objectid import ObjectId
from datetime import datetime
from app.api.routes.cnc import cnc_state

router = APIRouter()


@router.post("/jobs")
async def create_job(job: Job):
    result = await jobs_collection.insert_one(job.dict())
    return {"job_id": str(result.inserted_id)}

@router.get("/jobs")
async def get_jobs():

    jobs = []

    async for job in jobs_collection.find():
        job["_id"] = str(job["_id"])
        jobs.append(job)

    return jobs

@router.get("/jobs/next")
async def get_next_job():

    job = await jobs_collection.find_one_and_update(
        {"status": {"$in": ["ready_to_draw", "printing"]}},
        {"$set": {"status": "printing"}},
        sort=[("created_at", 1)]
    )

    if not job:
        return {"message": "No hay trabajos pendientes"}

    job["_id"] = str(job["_id"])
    
    # Calculate total lines of the G-code file so the ESP32 doesn't have to download it twice
    import os
    if job.get("gcode_path") and os.path.exists(job["gcode_path"]):
        with open(job["gcode_path"], "r") as f:
            job["total_lines"] = sum(1 for _ in f)
    else:
        job["total_lines"] = 0

    cnc_state["status"] = "drawing"
    cnc_state["progress"] = 0.0
    cnc_state["current_line"] = 0

    return job

@router.post("/jobs/{job_id}/complete")
async def complete_job(job_id: str):

    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {
            "$set": {
                "status": "completed",
                "last_printed_at": datetime.utcnow()
            },
            "$inc": {
                "print_count": 1
            }
        }
    )

    return {"message": "Trabajo completado"}

@router.post("/jobs/{job_id}/redraw")
async def redraw_job(job_id: str):
    await jobs_collection.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": {"status": "ready_to_draw"}}
    )
    return {"message": "Trabajo en cola para volver a dibujar"}
