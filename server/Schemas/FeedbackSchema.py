from pydantic import BaseModel, Field

class CreateFeedbackSchema(BaseModel):
    feedback_message: str = Field(..., example="Great service!")
    user_id: str = Field(..., example="user123")
    request_id: str = Field(..., example="req456")