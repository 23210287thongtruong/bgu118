from fastapi import status, HTTPException
import httpx
from datetime import datetime
from sqlmodel import Session, select
from models import ExchangeRate


async def create_exchange_rate(session: Session):
    today_date = datetime.today().strftime("%Y-%m-%d")
    USD_API_URL = f"https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@{today_date}/v1/currencies/usd.json"
    async with httpx.AsyncClient() as client:
        response = await client.get(USD_API_URL)
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            date = data.get("date")
            usd_to_vnd = data.get("usd").get("vnd")

            # Ensure the date is in the correct format for SQLite DATETIME
            if len(date) == 10:  # If the date is in YYYY-MM-DD format
                date += "T00:00:00Z"

            # Convert the date string to a datetime object
            recorded_at = datetime.strptime(date, "%Y-%m-%dT%H:%M:%SZ")
            curr_exchange_rate = get_latest_exchange_rate(session)

            if curr_exchange_rate and curr_exchange_rate.recorded_at == recorded_at:
                return curr_exchange_rate

            exchange_rate = ExchangeRate(
                recorded_at=recorded_at,
                usd_to_vnd=usd_to_vnd,
            )
            session.add(exchange_rate)
            session.commit()

        else:
            raise HTTPException(
                status_code=response.status_code, detail="Failed to fetch exchange rate"
            )


def get_exchange_rates(
    session: Session, start_date: datetime = None, end_date: datetime = None
):
    query = select(ExchangeRate)

    if start_date:
        query = query.where(ExchangeRate.recorded_at >= start_date)
    if end_date:
        query = query.where(ExchangeRate.recorded_at <= end_date)

    result = session.exec(query)
    exchange_rates = result.all()
    return exchange_rates


def get_latest_exchange_rate(session: Session) -> ExchangeRate:
    query = select(ExchangeRate).order_by(ExchangeRate.recorded_at.desc()).limit(1)
    result = session.exec(query)
    exchange_rate = result.first()
    return exchange_rate
