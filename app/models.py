from sqlmodel import Field, SQLModel
from datetime import datetime


class Asset(SQLModel, table=True):
    id: int = Field(primary_key=True)
    name: str


class ExchangeRate(SQLModel, table=True):
    recorded_at: datetime = Field(
        primary_key=True,
        default_factory=datetime.utcnow,
    )
    usd_to_vnd: float


class AssetPrice(SQLModel, table=True):
    asset_id: int = Field(foreign_key="asset.id", primary_key=True)
    price_recorded_at: datetime = Field(
        primary_key=True,
        default_factory=datetime.utcnow,
    )
    exchange_rate_recorded_at: int = Field(
        foreign_key="exchangerate.recorded_at", primary_key=True
    )

    usd_price: float
    vnd_price: float
