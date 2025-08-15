from fastapi import APIRouter
from typing import List

from Controllers.RequestController import get_available_slots_logic, get_requests_employees, get_requests_users

request_router = APIRouter(prefix="/appointments", tags=["Appointments"])

@request_router.get("/available-slots/{service_id}/{userId}")
async def get_available_slots(service_id: str, date: str, userId:str):
    """Get available time slots for a specific service and date"""
    return await get_available_slots_logic(service_id, date, userId)


@request_router.get("/get-request-users/{service_id}/{userId}")
async def get_request_users(service_id:str ,userId:str):
    return await get_requests_users(service_id, userId)

@request_router.get("/get-request-users/{service_id}/{empId}")
async def get_request_users(service_id:str ,empId:str):
    return await get_requests_users(service_id, empId)