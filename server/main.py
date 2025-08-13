from http import server
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

@app.get("/")
def home():
    return {'message': 'Welcome to the eGovDoc application!'}