from http import server
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from Routes.WarrentRoutes import warrent_router
from Routes.SalaryRoutes import salary_router
from Routes.AppointmentRoute import appointment_router
from Routes.FeedbackRoutes import feedback_router

app = FastAPI()

@app.get("/")
def home():
    return {'message': 'Welcome to the eGovDoc application!'}

app.include_router(warrent_router)
app.include_router(salary_router)
app.include_router(feedback_router)
app.include_router(appointment_router)
