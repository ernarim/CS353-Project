from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TicketCategory(BaseModel):
    event_id: UUID
    category_name: str
    price: float
    color: str

class TicketCategoryUpdate(BaseModel):
    price: Optional[float] = None
    color: Optional[str] = None

class TicketCategoryUpdateMultiple(BaseModel):
    category_name: str
    price: Optional[float] = None
    color: Optional[str] = None

class TicketCategoryCreate(BaseModel):
    category_name: str
    price: float
    color: str
