from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TicketCategory(BaseModel):
    event_id: UUID
    category_name: str
    price: float
    color: str

class TicketCategoryCreate(BaseModel):
    category_name: str
    price: float
    color: str
