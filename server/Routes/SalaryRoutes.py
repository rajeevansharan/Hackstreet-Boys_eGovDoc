from fastapi import APIRouter, UploadFile, File, Form, Depends
from typing import List, Optional
from datetime import datetime, time, date

from Models.SalaryModel import salaryModel
from Controllers.SalaryParticularControllelr import (
    create_salary_particular_logic,
    get_salary_particular
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
    AppointmentDate: date = Form(...),  
    UserId: str = Form(...),
    Area: str = Form(...),
    AppointmentTime: time = Form(...),
    AdditionalDetails: str = Form(...),
    files: Optional[List[UploadFile]] = File(...)
):
    """Create a new salary particular request with optional file uploads"""
    
    # Create schema object
    salary_data = CreateSalaryParticularSchema(
        fullname=fullname,
        NICNo=NICNo,
        PensionID=PensionID,
        ReasonForRequest=ReasonForRequest,
        PriorityLevel=PriorityLevel,
        AppointmentDate=AppointmentDate,
        AppointmentTime=AppointmentTime,
        AdditionalDetails=AdditionalDetails,
        UserId=UserId,
        Area=Area
    )
    
    return await create_salary_particular_logic(salary_data, files)


@salary_router.get("/get/{resourceId}", response_model=salaryModel)
async def getdetails(resourceId:str):
    return await get_salary_particular(resourceId)