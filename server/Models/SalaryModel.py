from pydantic import BaseModel , Field
from datetime import datetime
from typing import Optional, List

class SupportingDocument(BaseModel):
    """Model for supporting document metadata"""
    file_id: str = Field(..., description="GridFS file ID")
    filename: str = Field(..., description="Original filename")
    content_type: str = Field(..., description="MIME type of the file")
    upload_date: datetime = Field(..., description="When the file was uploaded")




class salaryModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id", description="MongoDB document ID")
    fullname: str = Field(..., example="John Doe")
    NICNo: str = Field(..., example="123456")
    PensionID: str = Field(..., example="IN23332")
    ReasonForRequest: str = Field(..., example="UniversityRegistration")
    PriorityLevel: str = Field(..., example="High")
    AppointmentDate: datetime = Field(..., example="2025-08-20T00:00:00")
    AppointmentTime: Optional[str] = Field(None, example="10:30 AM")
    AdditionalDetails: Optional[str] = Field(None, example="Additional information")
    UserId: str = Field(..., example="user123")
    supporting_documents: Optional[List[SupportingDocument]] = Field([], description="List of uploaded supporting documents")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Record creation timestamp")
    appointment_id: str = Field(..., example="689e496763c831f182b0f00c", description="Associated appointment ID")