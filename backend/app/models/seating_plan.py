from pydantic import BaseModel
from uuid import UUID

class SeatingPlan(BaseModel):
    event_id: UUID
    row: int
    column: int
    is_available: bool
    category_id: UUID
    