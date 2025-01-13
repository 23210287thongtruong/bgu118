from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models import ExchangeRate
from db import get_session
from services.exchange_rates_service import (
    create_exchange_rate as service_create_exchange_rate,
    get_exchange_rates as service_get_exchange_rates,
)

router = APIRouter()


@router.get(
    "/exchange-rates", status_code=status.HTTP_200_OK, response_model=List[ExchangeRate]
)
def get_exchange_rates(session: Session = Depends(get_session)):
    exchange_rates = service_get_exchange_rates(session)
    return exchange_rates


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
