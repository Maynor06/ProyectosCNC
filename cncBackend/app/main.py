from fastapi import FastAPI
from app.api.routes.jobs import router as jobs_router
from app.api.routes.generate import router as generate_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    docs_url="/docs",
    openapi_url="/openapi.json",
    root_path="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.mount(
    "/generated",
    StaticFiles(directory="generated"),
    name="generated"
)


from app.api.routes.jobs import router as jobs_router
from app.api.routes.generate import router as generate_router
from app.api.routes.cnc import router as cnc_router

app.include_router(jobs_router)
app.include_router(generate_router)
app.include_router(cnc_router)
@app.get("/")
async def root():
    return {"message": "CNC Backend funcionando"}
