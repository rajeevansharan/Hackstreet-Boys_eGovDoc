from Config.db import officer_profile_collection
from Schemas.ProfileSchema import OfficerProfileSchema
from fastapi import UploadFile,HTTPException
from typing import Optional,List
from datetime import datetime
from Config.db import fs


async def create_officer_profile_logic(
    phone: str,
    officeAddress: str,
    email: str,
    userId: str,
    profileImage: Optional[UploadFile],
) -> dict:
    profile_data = {
        "phone": phone,
        "officeAddress": officeAddress,
        "email": email,
        "userId": userId,
    }
    if profileImage and profileImage.filename:
        file_content = await profileImage.read()
        file_id = await fs.upload_from_stream(
            profileImage.filename,
            file_content,
            metadata={
                "content_type": profileImage.content_type,
                "upload_date": datetime.utcnow(),
            },
        )
        # Store GridFS file id and filename in the profile
        profile_data["profileImage"] = {
            "file_id": str(file_id),
            "filename": profileImage.filename,
            "content_type": profileImage.content_type or "application/octet-stream",
            "upload_date": datetime.utcnow(),
        }

    result = await officer_profile_collection.insert_one(profile_data)
    return {"inserted_id": str(result.inserted_id)}

async def get_officer_profile_by_userid_logic(userId: str) -> dict:
    """Return a single officer profile by userId"""
    doc = await officer_profile_collection.find_one({"userId": userId})
    if not doc:
        raise HTTPException(status_code=404, detail="Profile not found")
    doc["_id"] = str(doc["_id"])
    if "profileImage" in doc and isinstance(doc["profileImage"], dict):
        if "upload_date" in doc["profileImage"] and isinstance(doc["profileImage"]["upload_date"], datetime):
            doc["profileImage"]["upload_date"] = doc["profileImage"]["upload_date"].isoformat()
    return doc

async def get_all_officer_profiles_logic() -> List[dict]:
    """Return all officer profiles"""
    profiles: List[dict] = []
    cursor = officer_profile_collection.find({})
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if "profileImage" in doc and isinstance(doc["profileImage"], dict):
            if "upload_date" in doc["profileImage"] and isinstance(doc["profileImage"]["upload_date"], datetime):
                doc["profileImage"]["upload_date"] = doc["profileImage"]["upload_date"].isoformat()
        profiles.append(doc)
    return profiles
