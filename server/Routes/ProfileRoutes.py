from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Optional, List
from Controllers.ProfileController import (
    create_officer_profile_logic,
    get_officer_profile_by_userid_logic,
    get_all_officer_profiles_logic,
)
from utils.auth import get_employee_only

officer_profile_router = APIRouter(prefix="/officer-profile", tags=["OfficerProfile"])


@officer_profile_router.post("/create", response_model=dict)
async def create_officer_profile(
    phone: str = Form(...),
    officeAddress: str = Form(...),
    email: str = Form(...),
    userId: str = Form(...),
    profileImage: Optional[UploadFile] = File(None),
    current_employee=Depends(get_employee_only),  # Only GS/DS
):
    return await create_officer_profile_logic(
        phone, officeAddress, email, userId, profileImage
    )


# Get a single profile by userId
@officer_profile_router.get("/user/{userId}", response_model=dict)
async def get_officer_profile_by_user(
    userId: str,
    current_employee=Depends(get_employee_only),  # Only GS/DS
):
    return await get_officer_profile_by_userid_logic(userId)


# Get all profiles
@officer_profile_router.get("/all", response_model=List[dict])
async def get_all_officer_profiles(
    current_employee=Depends(get_employee_only),  # Only GS/DS
):
    return await get_all_officer_profiles_logic()
