from fastapi import APIRouter, status, Depends, HTTPException
from sqlmodel import Session
from typing import List
from models import AssetPrice
from db import get_session
from services.assets_service import (
    get_asset_prices as service_get_asset_prices,
    create_gold_price,
    create_bitcoin_price,
)

router = APIRouter()


@router.get(
    "/asset-prices", status_code=status.HTTP_200_OK, response_model=List[AssetPrice]
)
def get_asset_prices(asset_id: int, session: Session = Depends(get_session)):
    return service_get_asset_prices(asset_id, session)


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
