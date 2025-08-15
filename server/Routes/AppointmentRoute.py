from fastapi import APIRouter
from typing import List

from Controllers.AppointmentController import get_available_slots_logic, create_appointment_logic
from Schemas.AppointmentSchema import AppointmentCreateSchema
from Models.AppointmentModel import Appointment

appointment_router = APIRouter(prefix="/appointments", tags=["Appointments"])

@appointment_router.get("/available-slots/{service_id}")
async def get_available_slots(service_id: str, date: str):
    """Get available time slots for a specific service and date"""
    return await get_available_slots_logic(service_id, date)

@appointment_router.post("/create", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreateSchema):
    """Create a new appointment"""
    return await create_appointment_logic(appointment)
