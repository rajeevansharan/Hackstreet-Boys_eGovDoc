from pydantic import BaseModel, Field
from typing import Optional

class OfficerProfileSchema(BaseModel):
    phone: str = Field(..., example="0771234567")
    officeAddress: str = Field(..., example="123 Main St, Colombo")
    email: str = Field(..., example="officer@email.com")
    userId: str = Field(..., example="NIC123456")
    profileImage: Optional[str] = None  # This will store the filename or URL