from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class SeatingPlan(BaseModel):
    event_id: UUID
    category_name: str
    ticket_id: Optional[UUID]
    row_number: int
    column_number: int
    is_available: bool
    is_reserved: bool
    category_id: UUID

class ReserverSeating(BaseModel):
    event_id: UUID
    row_number: int
    column_number: int
