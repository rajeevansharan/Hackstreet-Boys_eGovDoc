from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class SupportingDocumentModel(BaseModel):
    file_id: str
    filename: str
    content_type: str
    upload_date: datetime


class WarrentModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    fullname: str
    pensionNo: str
    placeOfPaymentPension: str
    DateOfRetirement: datetime
    AnnualSalaryAtRetirementDate: float
    TravelClass: str
    MaritalStatus: str
    OrdinarysingleStatus: str
    TravelType: str
    DependantChildName: str
    DependantChildAge: int
    FromStation: str
    ToStation: str
    TravelDate: datetime
    ReturnDate: datetime
    PriorityLevel: str
    SpouseName: Optional[str] = ""
    SpouseDepartment: Optional[str] = ""
    AppointmentDate: str
    AppointmentTime: str
    Area: str
    created_at: datetime
    supporting_documents: Optional[List[SupportingDocumentModel]] = []
    request_id: Optional[str] = None
    UserId: str 
