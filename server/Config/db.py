from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from fastapi import HTTPException
import logging

URL = "mongodb+srv://sinthujan:Pwd2002@rootcodeproject.buidvwn.mongodb.net/"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = AsyncIOMotorClient(URL)
    db = client["rootcodeproject"]
    logger.info("Connected to MongoDB successfully.")
    warrent_collection = db.getCollection("Warrent")
    salary_particular_collection = db.getCollection("Salary_Particular")
    logger.info("Collections initialized successfully.")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise HTTPException(status_code=500, detail="Database connection error")
