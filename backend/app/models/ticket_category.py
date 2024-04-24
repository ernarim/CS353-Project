from pydantic import BaseModel
from uuid import UUID

class TicketCategory(BaseModel):
    event_id: UUID
    category_name: str
    price: float
    