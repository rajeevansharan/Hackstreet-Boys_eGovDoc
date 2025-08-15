from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import List, Optional
from datetime import datetime

from Models.SalaryModel import salaryModel
from Controllers.SalaryParticularControllelr import (
    create_salary_particular_logic,
    get_salary_particular_by_user_and_appointment_logic
)
from Schemas.SalarySchema import CreateSalaryParticularSchema

salary_router = APIRouter(prefix="/salary-particulars", tags=["Salary Particulars"])

@salary_router.post("/create", response_model=dict)
async def create_salary_particular(
    fullname: str = Form(...),
    NICNo: str = Form(...),
    PensionID: str = Form(...),
    ReasonForRequest: str = Form(...),
    PriorityLevel: str = Form(...),
    AppointmentDate: str = Form(...),  # Will be parsed to datetime
    UserId: str = Form(...),
    Area: str = Form(...),
    AppointmentTime: Optional[str] = Form(None),
    AdditionalDetails: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
):
    """Create a new salary particular request with optional file uploads"""
    # Parse appointment date
    try:
        appointment_date = datetime.fromisoformat(AppointmentDate.replace('Z', '+00:00'))
    except:
        appointment_date = datetime.strptime(AppointmentDate, "%Y-%m-%d")
    
    # Create schema object
    salary_data = CreateSalaryParticularSchema(
        fullname=fullname,
        NICNo=NICNo,
        PensionID=PensionID,
        ReasonForRequest=ReasonForRequest,
        PriorityLevel=PriorityLevel,
        AppointmentDate=appointment_date,
        AppointmentTime=AppointmentTime,
        AdditionalDetails=AdditionalDetails,
        UserId=UserId,
        Area=Area
    )
    
    return await create_salary_particular_logic(salary_data, files)


