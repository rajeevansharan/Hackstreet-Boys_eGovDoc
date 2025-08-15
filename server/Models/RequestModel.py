from pydantic import BaseModel , Field
from datetime import datetime
from typing import Optional, List, Union

class Request(BaseModel):
    """Complete request model - represents data stored in database"""
    id: Optional[str] = Field(None, alias="_id", description="MongoDB document ID")
    service_id: str = Field(..., example="service123")
    service_name: str = Field(..., example="Document Collection")
    status: str = Field(..., example="confirmed")
    created_at: datetime = Field(..., description="Date and time when the request was created")
    approved_at: Optional[datetime] = Field(None, description="Date and time when the request was approved")
    requestHandlerId: str = Field(..., example="GS001")
    user_Id: str = Field(..., example="user123")
    resource_id: str = Field(..., example="")
    resource_name: str = Field(..., example="")
    priority: str = Field(..., example="high")
    # Option 1: Store as separate date and time strings
    requestAppointmentDate: Union[str, datetime] = Field(..., example="2025-08-20", description="Requested appointment date")
    requestAppointmentTime: Union[str, datetime] = Field(..., example="10:30", description="Requested appointment time")
