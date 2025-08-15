from fastapi import HTTPException
from typing import List
from Models.FeedbackModel import FeedbackModel
from Config.db import feedback_collection
from Schemas.FeedbackSchema import CreateFeedbackSchema

async def create_feedback_logic(feedback: CreateFeedbackSchema) -> dict:
    try:
        feedback_dict = feedback.dict()
        result = await feedback_collection.insert_one(feedback_dict)
        return {"inserted_id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_feedbacks_logic() -> List[FeedbackModel]:
    try:
        feedbacks_cursor = feedback_collection.find()
        feedbacks = []
        async for feedback in feedbacks_cursor:
            feedback["_id"] = str(feedback["_id"])
            feedbacks.append(FeedbackModel(**feedback))
        return feedbacks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))