from http import server
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from Routes.WarrentRoutes import warrent_router

app = FastAPI()

@app.get("/")
def home():
    return {'message': 'Welcome to the eGovDoc application!'}

app.include_router(warrent_router)