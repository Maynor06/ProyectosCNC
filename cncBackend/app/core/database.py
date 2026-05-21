import os

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import MONGO_URL, DB_NAME

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)

db = client[DB_NAME]

jobs_collection = db["jobs"]
logs_collection = db["logs"]