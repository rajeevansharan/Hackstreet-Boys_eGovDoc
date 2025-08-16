from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    disabled: Optional[bool] = False
    dsdivision: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str
    nic: str
    address: Optional[str] = None

class UserInDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    role: str = "citizen"  # Default role for normal users

class User(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    created_at: Optional[datetime] = None
    role: str = "citizen"  # Include role in responses

class EmployeeLogin(BaseModel):
    username: str
    password: str

class EmployeeBase(BaseModel):
    UserName: str
    role: str
    NIC: str
    Gender: str
    PhoneNumber: str
    OfficeAddress: str
    DSDivision: str
    GSDivision: Optional[str] = None

class Employee(EmployeeBase):
    id: Optional[str] = Field(None, alias="_id")

class Token(BaseModel):
    access_token: str
    token_type: str
    username: str
    role: str  # Added role field to include in token response

class TokenData(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None  # Added role to token data

class EmailOTPVerify(BaseModel):
    email: str
    otp: str

class EmailRequest(BaseModel):
    email: str

class PasswordReset(BaseModel):
    email: str
    new_password: str
    confirm_password: str

class TokenResponse(BaseModel):
    """Response model when using HttpOnly cookies"""
    username: str
    role: str
    message: str = "Authentication successful"