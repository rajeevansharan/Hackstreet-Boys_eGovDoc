from fastapi import HTTPException
from typing import List
from server.Models.WarrentModel import WarrentModel
from server.Config.db import warrent_collection


async def get_Warrents_logic() -> List[WarrentModel]:
    try:
        warrents_cursor = warrent_collection.find()
        warrents = []
        async for warrent in warrents_cursor:
            warrent["_id"] = str(warrent["_id"])
            warrents.append(WarrentModel(**warrent))
        return warrents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
