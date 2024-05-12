from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TicketCategory(BaseModel):
    event_id: UUID
    category_name: str
    price: float
    start_row: Optional[int] = None
    end_row: Optional[int] = None
    start_column: Optional[int] = None
    end_column: Optional[int] = None
    
class TicketCategoryCreate(BaseModel):
    category_name: str
    price: float
    color: str
