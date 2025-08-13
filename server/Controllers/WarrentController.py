from fastapi import APIRouter, HTTPException
from typing import List
from server.Models.WarrentModel import WarrentModel
from server.Config.db import warrent_collection
from bson import ObjectId

warrent_router = APIRouter()


@warrent_router.get("/warrents", response_model=List[WarrentModel])
async def get_Warrents():
    try:
        warrents_cursor = warrent_collection.find()
        warrents = []
        async for warrent in warrents_cursor:
            warrent["_id"] = str(warrent["_id"])  # Convert ObjectId to string
            warrents.append(WarrentModel(**warrent))
        return warrents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
