from fastapi import FastAPI, HTTPException
import httpx
import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from models import Asset, ExchangeRate, AssetPrice

load_dotenv()

app = FastAPI()

GOLD_API_URL = os.getenv("GOLD_API_URL")
GOLD_API_KEY = os.getenv("GOLD_API_KEY")
USD_API_URL = os.getenv("USD_API_URL")
BITCOIN_API_URL = os.getenv("BITCOIN_API_URL")
BITCOIN_API_KEY = os.getenv("BITCOIN_API_KEY")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL, echo=True)


# Init database
@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/gold-price")
async def get_gold_price():
    headers = {"x-access-token": GOLD_API_KEY}
    async with httpx.AsyncClient() as client:
        response = await client.get(GOLD_API_URL, headers=headers)
        if response.status_code == 200:
            data = response.json()
            price = data.get("price")
            timestamp = data.get("timestamp")
            currency = data.get("currency")
            return {
                "timestamp": timestamp,
                "price": price,
                "currency": currency,
            }
        else:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to fetch gold price"
            )


@app.get("/usd-to-vnd-exchange-rate")
async def get_usd_to_vnd_exchange_rate():
    async with httpx.AsyncClient() as client:
        response = await client.get(USD_API_URL)
        if response.status_code == 200:
            data = response.json()
            date = data.get("date")
            usd_to_vnd = data.get("usd").get("vnd")
            return {
                "date": date,
                "usd_to_vnd": usd_to_vnd,
            }
        else:
            raise HTTPException(
                status_code=response.status_code,
                detail="Failed to fetch USD to VND exchange rate",
            )


@app.get("/bitcoin-price")
async def get_bitcoin_price():
    headers = {"X-CMC_PRO_API_KEY": BITCOIN_API_KEY}
    params = {"symbol": "BTC"}

    async with httpx.AsyncClient() as client:
        response = await client.get(BITCOIN_API_URL, headers=headers, params=params)
        if response.status_code == 200:
            data = response.json()
            price = data["data"]["BTC"]["quote"]["USD"]["price"]
            last_updated = data["data"]["BTC"]["quote"]["USD"]["last_updated"]
            return {"price": price, "last_updated": last_updated, "currency": "USD"}
        else:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to fetch Bitcoin price"
            )
