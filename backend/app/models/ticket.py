from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class Ticket(BaseModel):
    ticket_id: UUID
    row_number: Optional[int]
    column_number: Optional[int]

class TicketList(BaseModel):
    tickets: list[Ticket]

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
