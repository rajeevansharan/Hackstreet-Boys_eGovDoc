from pydantic import BaseModel, Field
from typing import Optional

class FeedbackModel(BaseModel):
    feedbackid: Optional[str] = Field(None, alias="_id", description="MongoDB document ID")
    feedback_message: str = Field(..., example="Great service!")
    user_id: str = Field(..., example="user123")
    request_id: str = Field(..., example="req456")