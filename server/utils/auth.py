import random
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi import Response, Cookie
from typing import Optional

from Models.AuthModels import UserInDB, TokenData, Employee
from Config.db import users_collection, employees_collection
from dotenv import load_dotenv
import os
load_dotenv()

# Configuration constants
SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
SENDER_EMAIL = "triatholan22@gmail.com"
SENDER_PASSWORD = "pfalvuyuumzlecjo"  # Gmail App Password

# Setup password context and OAuth2 scheme
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# In-memory OTP storage - in production, use a database or Redis
otp_store = {}

# Password handling functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# User retrieval functions
async def get_user(username: str):
    user = await users_collection.find_one({"username": username})
    if user:
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        return UserInDB(**user)
    return None

async def get_user_by_email(email: str):
    user = await users_collection.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
        return UserInDB(**user)
    return None

async def get_employee(username: str):
    employee = await employees_collection.find_one({"UserName": username})
    if employee:
        employee["_id"] = str(employee["_id"])
        return employee
    return None

# Authentication functions
async def authenticate_user(username: str, password: str):
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

async def authenticate_employee(username: str, password: str):
    employee = await get_employee(username)
    if not employee:
        return False
    # For employees, we're comparing plain passwords since they're stored directly
    if employee["Password"] != password:
        return False
    return employee

# Token generation and validation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def set_auth_cookie(response: Response, token: str):
    """Set JWT token as HttpOnly cookie"""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,  # Set to False if not using HTTPS in development
        samesite="lax",  # Helps prevent CSRF
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        path="/"  # Make cookie available across all routes
    )

def clear_auth_cookie(response: Response):
    """Clear the auth cookie on logout"""
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax",
        path="/"
    )

# Dependency for getting current user (works for both citizens and employees)
async def get_current_user(
    access_token: Optional[str] = Cookie(None, alias="access_token")
):
    """Get current user from access token cookie"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not access_token:
        raise credentials_exception
        
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        role = payload.get("role", "citizen")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    
    # Handle different user types based on role
    if token_data.role in ["GS", "DS"]:
        # Get employee
        employee = await get_employee(token_data.username)
        if employee is None:
            raise credentials_exception
        return employee
    else:
        # Get citizen user
        user = await get_user(token_data.username)
        if user is None:
            raise credentials_exception
        return user

# Active user dependency
async def get_current_active_user(current_user = Depends(get_current_user)):
    # For citizens, check disabled status
    if isinstance(current_user, UserInDB) and current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Check if user has GS or DS role
async def get_employee_only(current_user = Depends(get_current_user)):
    if not isinstance(current_user, dict) or current_user.get("role") not in ["GS", "DS"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only government employees can access this resource"
        )
    return current_user

# OTP generation and email functions
def generate_otp():
    return str(random.randint(100000, 999999))

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SENDER_EMAIL
        msg["To"] = to_email
        
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Email error: {str(e)}")
        return False

def store_otp(email: str, otp: str):
    # Store OTP with expiration time (5 minutes)
    otp_store[email] = {
        "otp": otp,
        "expires": datetime.utcnow() + timedelta(minutes=5)
    }

def verify_otp(email: str, otp: str):
    # Check if OTP exists and is valid
    stored = otp_store.get(email)
    if not stored:
        return False
    
    # Check if OTP is expired
    if datetime.utcnow() > stored["expires"]:
        del otp_store[email]
        return False
    
    # Verify OTP
    if stored["otp"] != otp:
        return False
    
    # OTP is valid, clean up
    del otp_store[email]
    return True

async def get_citizen_only(current_user = Depends(get_current_user)):
    """Ensure user is a citizen"""
    if isinstance(current_user, dict) or getattr(current_user, "role", None) != "citizen":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only citizens can access this resource"
        )
    return current_user

async def get_gs_only(current_user = Depends(get_current_user)):
    """Ensure user is a GS (Grama Sevaka)"""
    if not isinstance(current_user, dict) or current_user.get("role") != "GS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only GS officers can access this resource"
        )
    return current_user

async def get_ds_only(current_user = Depends(get_current_user)):
    """Ensure user is a DS (Divisional Secretary)"""
    if not isinstance(current_user, dict) or current_user.get("role") != "DS":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only DS officers can access this resource"
        )
    return current_user

async def has_permission(current_user = Depends(get_current_user), required_roles=None):
    """Generic role checker that accepts a list of allowed roles"""
    if required_roles is None:
        required_roles = ["GS", "DS", "citizen"]
        
    user_role = current_user.get("role") if isinstance(current_user, dict) else getattr(current_user, "role", None)
    
    if user_role not in required_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Required roles: {', '.join(required_roles)}"
        )
    return current_user