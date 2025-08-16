from fastapi import APIRouter, UploadFile, File, Form
from typing import List, Optional
from Models.WarrentModel import WarrentModel
from Controllers.WarrentController import (
    get_Warrents_logic,
    create_warrent_logic,
    approve_warrent_request_by_gs,
    approve_warrent_request_by_ds,
    create_appointment_from_warrent_request,
    get_warrents_by_userid_logic,
    reject_warrent_request,
)

warrent_router = APIRouter(prefix="/warrents", tags=["Warrents"])


@warrent_router.get("/getwarrents", response_model=List[WarrentModel])
async def get_Warrents():
    return await get_Warrents_logic()


@warrent_router.post("/createwarrents", response_model=dict)
async def create_warrent(
    fullname: str = Form(...),
    pensionNo: str = Form(...),
    placeOfPaymentPension: str = Form(...),
    DateOfRetirement: str = Form(...),
    AnnualSalaryAtRetirementDate: float = Form(...),
    TravelClass: str = Form(...),
    MaritalStatus: str = Form(...),
    OrdinarysingleStatus: str = Form(...),
    TravelType: str = Form(...),
    DependantChildName: str = Form(...),
    DependantChildAge: int = Form(...),
    FromStation: str = Form(...),
    ToStation: str = Form(...),
    TravelDate: str = Form(...),
    ReturnDate: str = Form(...),
    PriorityLevel: str = Form(...),
    SpouseName: Optional[str] = Form(None),
    SpouseDepartment: Optional[str] = Form(None),
    AppointmentDate: str = Form(...),
    AppointmentTime: str = Form(...),
    Area: str = Form(...),
    files: Optional[List[UploadFile]] = File(None),
):
    from Schemas.WarrentSchema import CreateWarrentSchema
    from datetime import datetime

    user_id = str(current_user.id)
    print(dir(current_user))

    warrent = CreateWarrentSchema(
        fullname=fullname,
        pensionNo=pensionNo,
        placeOfPaymentPension=placeOfPaymentPension,
        DateOfRetirement=datetime.fromisoformat(DateOfRetirement),
        AnnualSalaryAtRetirementDate=AnnualSalaryAtRetirementDate,
        TravelClass=TravelClass,
        MaritalStatus=MaritalStatus,
        OrdinarysingleStatus=OrdinarysingleStatus,
        TravelType=TravelType,
        DependantChildName=DependantChildName,
        DependantChildAge=DependantChildAge,
        FromStation=FromStation,
        ToStation=ToStation,
        TravelDate=datetime.fromisoformat(TravelDate),
        ReturnDate=datetime.fromisoformat(ReturnDate),
        PriorityLevel=PriorityLevel,
        SpouseName=SpouseName,
        SpouseDepartment=SpouseDepartment,
        AppointmentDate=AppointmentDate,
        AppointmentTime=AppointmentTime,
        Area=Area,
        UserId=user_id
    )
    return await create_warrent_logic(warrent, files)


@warrent_router.post("/approve_gs/{request_id}", response_model=dict)
async def approve_gs(request_id: str, gs_handler_id: str = Form(...)):
    return await approve_warrent_request_by_gs(request_id, gs_handler_id)


@warrent_router.post("/approve_ds/{request_id}", response_model=dict)
async def approve_ds(request_id: str, ds_handler_id: str = Form(...)):
    return await approve_warrent_request_by_ds(request_id, ds_handler_id)


@warrent_router.post("/create_appointment", response_model=dict)
async def create_appointment(
    request_id: str = Form(...),
    user_id: str = Form(...),
):
    return await create_appointment_from_warrent_request(request_id, user_id)


@warrent_router.get("/gs/requests/{gs_handler_id}", response_model=List[dict])
async def get_gs_requests(gs_handler_id: str):
    from Controllers.WarrentController import get_requests_for_gs

    return await get_requests_for_gs(gs_handler_id)


@warrent_router.get("/ds/requests/{ds_handler_id}", response_model=List[dict])
async def get_ds_requests(ds_handler_id: str):
    from Controllers.WarrentController import get_requests_for_ds

    return await get_requests_for_ds(ds_handler_id)


@warrent_router.get("/user/{user_id}/warrents", response_model=List[dict])
async def get_warrents_by_userid(user_id: str):
    return await get_warrents_by_userid_logic(user_id)


@warrent_router.post("/reject/{request_id}", response_model=dict)
async def reject_request(request_id: str):
    return await reject_warrent_request(request_id)
