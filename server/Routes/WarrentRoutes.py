from fastapi import APIRouter
from typing import List
from server.Models.WarrentModel import WarrentModel
from server.Controllers.WarrentController import *

warrent_router = APIRouter(prefix="/warrents",tags=["Warrents"])


@warrent_router.get("/getwarrents", response_model=List[WarrentModel])
async def get_Warrents():
    return await get_Warrents_logic()
