from fastapi import APIRouter
from typing import List
from Models.WarrentModel import WarrentModel
from Controllers.WarrentController import get_Warrents_logic, create_warrent_logic

warrent_router = APIRouter(prefix="/warrents", tags=["Warrents"])


@warrent_router.get("/getwarrents", response_model=List[WarrentModel])
async def get_Warrents():
    return await get_Warrents_logic()


@warrent_router.post("/createwarrents", response_model=dict)
async def create_warrent(warrent: WarrentModel):
    return await create_warrent_logic(warrent)
