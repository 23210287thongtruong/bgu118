from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models import AssetPrice
from db import get_session
from services.assets_service import (
    get_gold_prices as service_get_gold_prices,
    get_bitcoin_prices as service_get_bitcoin_prices,
    get_latest_gold_price as service_get_latest_gold_price,
    get_latest_bitcoin_price as service_get_latest_bitcoin_price,
    create_gold_price,
    create_bitcoin_price,
)
from datetime import datetime

router = APIRouter()


@router.get(
    "/gold-prices", status_code=status.HTTP_200_OK, response_model=List[AssetPrice]
)
def get_gold_prices(
    session: Session = Depends(get_session),
    start_date: datetime = None,
    end_date: datetime = None,
):
    return service_get_gold_prices(session, start_date, end_date)


@router.get(
    "/gold-prices/latest", status_code=status.HTTP_200_OK, response_model=AssetPrice
)
def get_latest_gold_price(session: Session = Depends(get_session)):
    return service_get_latest_gold_price(session)


@router.get(
    "/bitcoin-prices", status_code=status.HTTP_200_OK, response_model=List[AssetPrice]
)
def get_bitcoin_prices(
    session: Session = Depends(get_session),
    start_date: datetime = None,
    end_date: datetime = None,
):
    return service_get_bitcoin_prices(session, start_date, end_date)


@router.get(
    "/bitcoin-prices/latest", status_code=status.HTTP_200_OK, response_model=AssetPrice
)
def get_latest_bitcoin_price(session: Session = Depends(get_session)):
    return service_get_latest_bitcoin_price(session)


@router.post("/assets-prices", status_code=status.HTTP_201_CREATED)
async def create_assets_prices(session: Session = Depends(get_session)):
    try:
        await create_gold_price(session)
        await create_bitcoin_price(session)
        return {"message": "Assets prices created successfully"}
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create assets prices",
        )
