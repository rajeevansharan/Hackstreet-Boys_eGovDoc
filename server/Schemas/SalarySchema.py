from pydantic import BaseModel, Field
from datetime import datetime, date, time
from typing import Optional

class CreateSalaryParticularSchema(BaseModel):
    """Schema for creating salary particular requests without file data"""
    fullname: str = Field(..., example="John Doe")
    NICNo: str = Field(..., example="123456789V")
    PensionID: str = Field(..., example="IN23332")
    ReasonForRequest: str = Field(..., example="University Registration")
    PriorityLevel: str = Field(..., example="High")
    AppointmentDate: date = Field(..., example="2025-08-20")
    AppointmentTime: time = Field(None, example="10:30 AM")
    AdditionalDetails: Optional[str] = Field(None, example="Additional information")
    UserId: str = Field(..., example="user123")
    Area: str = Field(...,example="Jaffna")