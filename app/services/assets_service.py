from fastapi import status, HTTPException
import httpx
from datetime import datetime, timedelta
from config import (
    GOLD_API_KEY,
    BITCOIN_API_KEY,
)
from sqlmodel import Session, select
from models import AssetPrice
from services.exchange_rates_service import get_current_exchange_rate


async def create_gold_price(session: Session):
    GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD"
    headers = {"x-access-token": GOLD_API_KEY}
    async with httpx.AsyncClient() as client:
        response = await client.get(GOLD_API_URL, headers=headers)
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            price = data.get("price")
            timestamp = data.get("timestamp")

            # Turn the value of timestamp to a datetime object
            price_recorded_at = datetime.fromtimestamp(timestamp)

            prev_gold_price = get_first_asset_price(1, session)
            if (
                prev_gold_price
                and prev_gold_price.price_recorded_at == timestamp
                and prev_gold_price.usd_price == price
            ):
                return prev_gold_price

            else:
                curr_exchange_rate = get_current_exchange_rate(session)
                if curr_exchange_rate is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="No exchange rate found",
                    )

                gold_price = AssetPrice(
                    asset_id=1,
                    price_recorded_at=price_recorded_at,
                    exchange_rate_recorded_at=curr_exchange_rate.recorded_at,
                    usd_price=price,
                    vnd_price=price * curr_exchange_rate.usd_to_vnd,
                )
                session.add(gold_price)
                session.commit()

        else:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to fetch gold price"
            )


async def create_bitcoin_price(session: Session):
    BITCOIN_API_URL = (
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest"
    )
    headers = {"X-CMC_PRO_API_KEY": BITCOIN_API_KEY}
    params = {"symbol": "BTC"}

    async with httpx.AsyncClient() as client:
        response = await client.get(BITCOIN_API_URL, headers=headers, params=params)
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            price = data["data"]["BTC"]["quote"]["USD"]["price"]
            last_updated = data["data"]["BTC"]["quote"]["USD"]["last_updated"]

            price_recorded_at = datetime.strptime(last_updated, "%Y-%m-%dT%H:%M:%S.%fZ")
            price_recorded_at += timedelta(hours=7)

            prev_bitcoin_price = get_first_asset_price(2, session)
            if (
                prev_bitcoin_price
                and prev_bitcoin_price.price_recorded_at == last_updated
                and prev_bitcoin_price.usd_price == price
            ):
                return prev_bitcoin_price
            else:
                curr_exchange_rate = get_current_exchange_rate(session)

                if curr_exchange_rate is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="No exchange rate found",
                    )

                bitcoin_price = AssetPrice(
                    asset_id=2,
                    price_recorded_at=price_recorded_at,
                    exchange_rate_recorded_at=curr_exchange_rate.recorded_at,
                    usd_price=price,
                    vnd_price=price * curr_exchange_rate.usd_to_vnd,
                )

                session.add(bitcoin_price)
                session.commit()
        else:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to fetch Bitcoin price"
            )


def get_asset_prices(asset_id: int, session: Session):
    query = select(AssetPrice).where(AssetPrice.asset_id == asset_id)
    result = session.exec(query)
    asset_prices = result.all()
    return asset_prices


def get_first_asset_price(asset_id: int, session: Session):
    query = select(AssetPrice).where(AssetPrice.asset_id == asset_id).limit(1)
    result = session.exec(query)
    asset_price = result.first()
    return asset_price
