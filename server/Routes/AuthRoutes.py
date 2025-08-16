from fastapi import APIRouter, Depends, HTTPException, status, Form
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Response
from Models.AuthModels import TokenResponse
from utils.auth import get_user

from Models.AuthModels import (
    UserCreate, 
    User, 
    Token, 
    EmailOTPVerify, 
    EmailRequest,
    PasswordReset,
    EmployeeLogin
)
from Controllers.AuthController import (
    signup_logic,
    verify_email_logic,
    complete_registration_logic,
    login_logic,
    employee_login_logic,
    request_password_reset_logic,
    verify_reset_otp_logic,
    reset_password_logic,
    logout_logic,
    login_verify_credentials,
    login_verify_otp,
    employee_login_verify_credentials,
    employee_login_verify_otp,

    
)
from utils.auth import get_current_active_user, get_employee_only

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# Citizen routes
@auth_router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate):
    """Register a new citizen user and send verification email"""
    return await signup_logic(user_data)

@auth_router.post("/verify-email", response_model=dict)
async def verify_email(data: EmailOTPVerify):
    """Verify email with OTP"""
    return await verify_email_logic(data.email, data.otp)

@auth_router.post("/complete-registration", response_model=TokenResponse)
async def complete_registration(user_data: UserCreate, response: Response):
    """Complete user registration after email verification"""
    return await complete_registration_logic(user_data, response)

@auth_router.post("/login", response_model=TokenResponse)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate citizen user and set auth cookie"""
    return await login_logic(form_data.username, form_data.password, response)

# Employee routes
@auth_router.post("/employee/login", response_model=TokenResponse)
async def employee_login(response: Response,form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate government employee and set auth cookie"""
    return await employee_login_logic(form_data.username, form_data.password, response)

# Password reset routes
@auth_router.post("/forgot-password", response_model=dict)
async def forgot_password(data: EmailRequest):
    """Request password reset email"""
    return await request_password_reset_logic(data.email)

@auth_router.post("/verify-reset-otp", response_model=dict)
async def verify_reset_otp(data: EmailOTPVerify):
    """Verify password reset OTP"""
    return await verify_reset_otp_logic(data.email, data.otp)

@auth_router.post("/logout", response_model=dict)
async def logout(response: Response):
    """Log out user by clearing auth cookie"""
    return await logout_logic(response)


@auth_router.post("/reset-password", response_model=dict)
async def reset_password(data: PasswordReset):
    """Reset password after OTP verification"""
    return await reset_password_logic(data.email, data.new_password, data.confirm_password)

# User profile routes
@auth_router.get("/me", response_model=dict)
async def get_user_profile(current_user = Depends(get_current_active_user)):
    """Get current user profile (works for both citizens and employees)"""
    # Handle different user types
    if isinstance(current_user, dict) and "role" in current_user:
        # This is an employee
        return {
            "username": current_user["UserName"],
            "role": current_user["role"],
            "nic": current_user["NIC"],
            "dsdivision": current_user["DSDivision"],
            "gsdivision": current_user.get("GSDivision"),
            "office_address": current_user["OfficeAddress"]
        }
    else:
        # This is a citizen
        return {
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "role": "citizen",
            "dsdivision": current_user.dsdivision
        }

# Admin/employee only route example
@auth_router.get("/admin-panel", response_model=dict)
async def admin_panel(current_employee = Depends(get_employee_only)):
    """Example of a route that only government employees can access"""
    return {
        "message": f"Welcome to the admin panel, {current_employee['UserName']}",
        "role": current_employee["role"],
        "division": current_employee["DSDivision"]
    }

# Add new routes
@auth_router.post("/login-verify", response_model=dict)
async def login_step1(form_data: OAuth2PasswordRequestForm = Depends()):
    """First step of login - verify credentials and send OTP"""
    return await login_verify_credentials(form_data.username, form_data.password)

@auth_router.post("/login-verify-otp", response_model=TokenResponse)
async def login_step2(data: EmailOTPVerify, response: Response):
    """Second step of login - verify OTP and complete login"""
    return await login_verify_otp(data.email, data.otp, response)


@auth_router.post("/get-user-email", response_model=dict)
async def get_user_email(data: dict):
    """Get email for a user by username"""
    username = data.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")
    
    user = await get_user(username)
    if not user:
        # Don't reveal if user exists or not
        return {"message": "If username exists, a reset link will be sent"}
    
    # Return the email associated with the username
    return {"email": user.email}


@auth_router.post("/employee-login-verify", response_model=dict)
async def employee_login_step1(form_data: OAuth2PasswordRequestForm = Depends()):
    """First step of employee login - verify credentials and send OTP to email"""
    return await employee_login_verify_credentials(form_data.username, form_data.password)

@auth_router.post("/employee-login-verify-otp", response_model=TokenResponse)
async def employee_login_step2(data: EmailOTPVerify, response: Response):
    """Second step of employee login - verify OTP and complete login"""
    return await employee_login_verify_otp(data.email, data.otp, response)