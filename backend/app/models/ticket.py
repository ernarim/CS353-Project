from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class Ticket(BaseModel):
    ticket_id: UUID
    seat_number: str
    is_sold: bool = False
    event_id: UUID
    category_name: str
    
class TicketInfo(BaseModel):
    ticket_id: UUID
    event_id: UUID
    organizer_id: UUID
    name: str
    date: datetime
    category_name: str
    price: float
    row_number: int
    column_number: int
