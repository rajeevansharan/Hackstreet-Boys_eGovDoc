from fastapi import HTTPException, status
from datetime import timedelta
from bson import ObjectId
from fastapi import Response
from Models.AuthModels import TokenResponse

from Models.AuthModels import UserCreate, UserInDB, User, Token
from Config.db import users_collection, employees_collection
from utils.auth import (
    get_password_hash, 
    authenticate_user,
    authenticate_employee,
    create_access_token, 
    get_user_by_email,
    generate_otp,
    send_email,
    store_otp,
    verify_otp,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    set_auth_cookie,
    clear_auth_cookie,
    get_employee
)

# Signup logic (only for citizens)
async def signup_logic(user_data: UserCreate):
    # Check if passwords match
    if user_data.password != user_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Check if username exists
    existing_user = await users_collection.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Check if email exists
    existing_email = await users_collection.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate OTP and send email
    otp = generate_otp()
    email_sent = send_email(
        user_data.email,
        "eGovDoc - Verify Your Email",
        f"Your verification code is: {otp}. It will expire in 5 minutes."
    )
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    # Store OTP for verification
    store_otp(user_data.email, otp)
    
    # Store user data temporarily (can be done in Redis or similar in production)
    # For now, we'll return success and handle verification in the next step
    return {"message": "Verification code sent to your email"}

# Verify email OTP logic
async def verify_email_logic(email: str, otp: str):
    # Verify OTP
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    return {"message": "Email verified successfully"}

# Complete registration after email verification
async def complete_registration_logic(user_data: UserCreate, response: Response):
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user object for database
    user_db = UserInDB(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        nic=user_data.nic,
        address=user_data.address,
        dsdivision=user_data.dsdivision,
        role="citizen"  # Set role for citizens
    )
    
    # Insert user into database
    result = await users_collection.insert_one(user_db.dict(by_alias=True, exclude={"id"}))
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.username, "role": "citizen"},
        expires_delta=access_token_expires
    )
    
    # Set the cookie in the response
    set_auth_cookie(response, access_token)
    
    return TokenResponse(
        username=user_data.username,
        role="citizen"
    )

# Citizen login logic
async def login_logic(username: str, password: str, response: Response):
    user = await authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": "citizen"},
        expires_delta=access_token_expires
    )
    
    # Set the cookie
    set_auth_cookie(response, access_token)
    
    return TokenResponse(
        username=user.username,
        role="citizen"
    )

# Employee login logic
async def employee_login_logic(username: str, password: str, response: Response):
    employee = await authenticate_employee(username, password)
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": employee["UserName"], "role": employee["role"]},
        expires_delta=access_token_expires
    )
    
    # Set the cookie
    set_auth_cookie(response, access_token)
    
    return TokenResponse(
        username=employee["UserName"],
        role=employee["role"]
    )

# Request password reset logic
async def request_password_reset_logic(email: str):
    user = await get_user_by_email(email)
    if not user:
        # Don't reveal that the email doesn't exist
        return {"message": "If your email is registered, you will receive a reset code"}
    
    # Generate OTP and send email
    otp = generate_otp()
    email_sent = send_email(
        email,
        "eGovDoc - Password Reset",
        f"Your password reset code is: {otp}. It will expire in 5 minutes."
    )
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    
    # Store OTP for verification
    store_otp(email, otp)
    
    return {"message": "If your email is registered, you will receive a reset code"}

# Verify password reset OTP logic
async def verify_reset_otp_logic(email: str, otp: str):
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired reset code")
    
    return {"message": "Reset code verified successfully"}

# Reset password logic
async def reset_password_logic(email: str, new_password: str, confirm_password: str):
    if new_password != confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password
    hashed_password = get_password_hash(new_password)
    
    # Update user in database
    await users_collection.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return {"message": "Password reset successfully"}


# Add logout logic
async def logout_logic(response: Response):
    """Handle user logout by clearing auth cookie"""
    clear_auth_cookie(response)
    return {"message": "Logged out successfully"}


# Add new function for first step of login (credentials verification)
async def login_verify_credentials(username: str, password: str):
    user = await authenticate_user(username, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate and send OTP to user's email
    otp = generate_otp()
    email_sent = send_email(
        user.email,
        "eGovDoc - Login Verification",
        f"Your login verification code is: {otp}. It will expire in 5 minutes."
    )
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    # Store OTP for verification
    store_otp(user.email, otp)
    
    return {"message": "Verification code sent to your email", "email": user.email}

# Add new function for second step of login (OTP verification)
async def login_verify_otp(email: str, otp: str, response: Response):
    # Verify OTP
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Get user by email
    user = await get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create token after successful OTP verification
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": "citizen"},
        expires_delta=access_token_expires
    )
    
    # Set the cookie
    set_auth_cookie(response, access_token)
    
    return TokenResponse(
        username=user.username,
        role="citizen",
        message="Login successful"  
    )

async def employee_login_verify_credentials(username: str, password: str):
    """Verify employee credentials and send OTP to their email"""
    employee = await get_employee(username)
    if not employee or employee["Password"] != password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get email from employee record
    employee_email = employee.get("Email") or employee.get("email")
    if not employee_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No email address found for this employee"
        )
    
    # Generate and send OTP
    otp = generate_otp()
    email_sent = send_email(
        employee_email,
        "eGovDoc - Employee Login Verification",
        f"Your login verification code is: {otp}. It will expire in 5 minutes."
    )
    
    if not email_sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    # Store OTP
    store_otp(employee_email, otp)
    
    return {"message": "Verification code sent to your email", "email": employee_email}

async def employee_login_verify_otp(email: str, otp: str, response: Response):
    """Verify employee OTP and complete login"""
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # Find employee by email
    employee = await employees_collection.find_one({"Email": email})
    if not employee:
        employee = await employees_collection.find_one({"email": email})
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Create token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": employee["UserName"], "role": employee["role"]},
        expires_delta=access_token_expires
    )
    
    # Set cookie
    set_auth_cookie(response, access_token)
    
    return TokenResponse(
        username=employee["UserName"],
        role=employee["role"],
        message="Login successful"
    )