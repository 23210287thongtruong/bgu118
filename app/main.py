from fastapi import FastAPI
from routers import assets, exchange_rates
from db import create_db_and_tables

app = FastAPI()


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


app.include_router(assets.router, prefix="/api", tags=["assets"])
app.include_router(exchange_rates.router, prefix="/api", tags=["exchange_rates"])


@app.get("/")
async def root():
    return {"message": "Hello World"}
