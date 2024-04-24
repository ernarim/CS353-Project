from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class Event(BaseModel):
    event_id: UUID
    name: str
    date: datetime
    description: str
    is_done: bool
    remaining_seat_no: int
    return_expire_date: datetime
    organizer_id: UUID
    venue_id: UUID
    category_id: UUID