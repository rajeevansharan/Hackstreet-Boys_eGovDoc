from motor.motor_asyncio import AsyncIOMotorClient
import logging

URL = "mongodb+srv://sinthujan:Pwd2002@rootcodeproject.buidvwn.mongodb.net/"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = AsyncIOMotorClient(URL)
    db = client["eGovDoc"]
    logger.info("Connected to MongoDB successfully.")
    warrent_collection = db["Warrent"]
    salary_particular_collection = db["Salary_Particular"]
    logger.info("Collections initialized successfully.")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise RuntimeError("Database connection error")
