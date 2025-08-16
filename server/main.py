from http import server
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from Routes.WarrentRoutes import warrent_router
from Routes.SalaryRoutes import salary_router
from Routes.RequestRoute import request_router
from Routes.FeedbackRoutes import feedback_router
from Routes.AuthRoutes import auth_router
from Routes.ProfileRoutes import officer_profile_router


app = FastAPI()


# Configure CORS
origins = [
    "http://localhost:5173",          # Development frontend
    "http://localhost:3000",          # Another possible dev port
    "https://your-production-url.com"  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {'message': 'Welcome to the eGovDoc application!'}

app.include_router(warrent_router)
app.include_router(salary_router)
app.include_router(feedback_router)
app.include_router(request_router)
app.include_router(auth_router)
app.include_router(officer_profile_router)