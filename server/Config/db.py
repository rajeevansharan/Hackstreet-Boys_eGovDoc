from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import logging

URL = "mongodb+srv://sinthujan:Pwd2002@rootcodeproject.buidvwn.mongodb.net/"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    client = AsyncIOMotorClient(URL)
    db = client["eGovDoc"]

    # GridFS for file storage - using the correct Motor import
    fs = AsyncIOMotorGridFSBucket(db)

    logger.info("Connected to MongoDB successfully.")
    warrent_collection = db["Warrent"]
    salary_particular_collection = db["Salary_Particular"]
    appointments_collection = db["Appointments"]
    services_collection = db["Services"]
    requests_collection = db["Requests"]
    employees_collection = db["GOV_Employees"]
    users_collection = db["Users"]
    feedback_collection = db["Feedback"]
    officer_profile_collection = db["Profile"]  
    logger.info("Collections initialized successfully.")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise RuntimeError("Database connection error")
