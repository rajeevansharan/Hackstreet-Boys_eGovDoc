from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class WarrentModel(BaseModel):
    id: Optional[str] = Field(None, alias="_id", description="MongoDB document ID")
    fullname: str = Field(..., example="John Doe")
    pensionNo: str = Field(..., example="PEN123456")
    placeOfPaymentPension: str = Field(..., example="Colombo")
    DateOfRetirement: datetime = Field(..., example="2025-08-13T00:00:00")
    AnnualSalaryAtRetirementDate: float = Field(..., example=50000.0)
    TravelClass: str = Field(..., example="First")
    MartialStatus: str = Field(..., example="Married")
    OrdinarysingleStatus: str = Field(..., example="Single")
    TravelType: str = Field(..., example="Official")
    DependantChildName: str = Field(..., example="Jane Doe")
    DependantChildAge: int = Field(..., example=12)
    FromStation: str = Field(..., example="Station A")
    ToStation: str = Field(..., example="Station B")
    TravelDate: datetime = Field(..., example="2025-09-01T00:00:00")
    ReturnDate: datetime = Field(..., example="2025-09-10T00:00:00")
    PriorityLevel: str = Field(..., example="High")
    RequiredCompletionDate: datetime = Field(..., example="2025-08-20T00:00:00")
    SpouseName: Optional[str] = Field(None, example="Jane Doe")
    SpouseDepartment: Optional[str] = Field(None, example="Finance")
