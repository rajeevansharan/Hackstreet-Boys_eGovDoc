from fastapi import APIRouter
from typing import List
from Models.WarrentModel import WarrentModel
from Controllers.WarrentController import *

warrent_router = APIRouter(prefix="/warrents",tags=["Warrents"])


@warrent_router.get("/getwarrents", response_model=List[WarrentModel])
async def get_Warrents():
    return await get_Warrents_logic()
