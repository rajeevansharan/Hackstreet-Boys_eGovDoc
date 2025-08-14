from pydantic import BaseModel, Field
from typing import Optional

class AppointmentCreateSchema(BaseModel):
    """Schema for creating new appointments - validates incoming request data"""
    service_id: str = Field(..., example="service123", description="ID of the service to book")
    date: str = Field(..., example="2025-08-20", description="Appointment date in YYYY-MM-DD format")
    time: str = Field(..., example="10:30", description="Appointment time in HH:MM format")
    userId: str = Field(..., example="user123", description="User ID from authentication")
    user_name: str = Field(..., example="John Doe", description="Full name of the user")
