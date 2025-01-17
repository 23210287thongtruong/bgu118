from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models import ExchangeRate
from db import get_session
from services.exchange_rates_service import (
    create_exchange_rate as service_create_exchange_rate,
    get_exchange_rates as service_get_exchange_rates,
    get_latest_exchange_rate as service_get_latest_exchange_rate,
)
from datetime import datetime

router = APIRouter()


@router.get(
    "/exchange-rates", status_code=status.HTTP_200_OK, response_model=List[ExchangeRate]
)
def get_exchange_rates(
    session: Session = Depends(get_session),
    start_date: datetime = None,
    end_date: datetime = None,
):
    exchange_rates = service_get_exchange_rates(session, start_date, end_date)
    return exchange_rates


@router.get(
    "/exchange-rates/latest",
    status_code=status.HTTP_200_OK,
    response_model=ExchangeRate,
)
def get_latest_exchange_rate(session: Session = Depends(get_session)):
    exchange_rate = service_get_latest_exchange_rate(session)
    return exchange_rate


@router.post("/exchange-rates", status_code=status.HTTP_201_CREATED)
async def create_exchange_rate(session: Session = Depends(get_session)):
    try:
        await service_create_exchange_rate(session)
        return {"message": "Exchange rate created successfully"}
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create exchange rate",
        )
