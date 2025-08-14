from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Service(BaseModel):
    id: Optional[str] = None
    serviceId:str
    name: str
    duration: int  # in minutes
    description: Optional[str] = None

class AppointmentCreate(BaseModel):
    service_id: str
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format
    user_name: str
    user_email: str
    user_phone: str

class Appointment(BaseModel):
    """Complete appointment model - represents data stored in database"""
    id: Optional[str] = Field(None, alias="_id", description="MongoDB document ID")
    service_id: str = Field(..., example="service123")
    service_name: str = Field(..., example="Document Collection")
    date: str = Field(..., example="2025-08-20")
    time: str = Field(..., example="10:30")
    user_Id: str = Field(..., example="user123")
    user_name: str = Field(..., example="John Doe")
    booking_reference: str = Field(..., example="BK12345678")
    qr_code: str = Field(..., description="Base64 encoded QR code image")
    status: str = Field(..., example="confirmed")
    created_at: datetime = Field(..., description="Appointment creation timestamp")