from pydantic import BaseModel
from uuid import UUID

class Ticket(BaseModel):
    ticket_id: UUID
    seat_number: str
    is_sold: bool = False
    event_id: UUID
    category_name: str
    
