from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CreateSalaryParticularSchema(BaseModel):
    """Schema for creating salary particular requests without file data"""
    fullname: str = Field(..., example="John Doe")
    NICNo: str = Field(..., example="123456789V")
    PensionID: str = Field(..., example="IN23332")
    ReasonForRequest: str = Field(..., example="University Registration")
    PriorityLevel: str = Field(..., example="High")
    AppointmentDate: datetime = Field(..., example="2025-08-20T00:00:00")
    AppointmentTime: str = Field(None, example="10:30 AM")
    AdditionalDetails: Optional[str] = Field(None, example="Additional information")
    UserId: str = Field(..., example="user123"),
    Area: str = Field(..., example="jaffna")