from pydantic import BaseModel, Field
from typing import Optional

class OfficerProfileModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    phone: str
    officeAddress: str
    email: str
    userId: str
    profileImage: Optional[str] = None