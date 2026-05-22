from fastapi import APIRouter
from app.models.job import Job
from app.core.database import jobs_collection
from bson.objectid import ObjectId
from datetime import datetime

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
        {"status": "ready_to_draw"},
        {"$set": {"status": "printing"}},
        sort=[("created_at", 1)]
    )

    if not job:
        return {"message": "No hay trabajos pendientes"}

    job["_id"] = str(job["_id"])

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
