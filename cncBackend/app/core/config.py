from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")