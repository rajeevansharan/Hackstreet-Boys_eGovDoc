from fastapi import HTTPException
from typing import List
from Models.WarrentModel import WarrentModel
from Config.db import warrent_collection


async def create_warrent_logic(warrent: WarrentModel) -> dict:
    try:
        warrent_dict = warrent.dict(by_alias=True)
        result = await warrent_collection.insert_one(warrent_dict)
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
