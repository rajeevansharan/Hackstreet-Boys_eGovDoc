from fastapi import APIRouter
from typing import List
from Models.FeedbackModel import FeedbackModel
from Controllers.FeedbackController import create_feedback_logic, get_feedbacks_logic
from Schemas.FeedbackSchema import CreateFeedbackSchema

feedback_router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])

@feedback_router.post("/create", response_model=dict)
async def create_feedback(feedback: CreateFeedbackSchema):
    return await create_feedback_logic(feedback)

@feedback_router.get("/get", response_model=List[FeedbackModel])
async def get_feedbacks():
    return await get_feedbacks_logic()