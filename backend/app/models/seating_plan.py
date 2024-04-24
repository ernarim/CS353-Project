from pydantic import BaseModel
from uuid import UUID

class SeatingPlan(BaseModel):
    event_id: UUID
    category_name: str
    row_number: int
    column_number: int
    is_available: bool
    category_id: UUID
