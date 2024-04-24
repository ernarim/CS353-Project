from pydantic import BaseModel
from uuid import UUID

class Venue(BaseModel):
    venue_id: UUID
    name: str
    city: str
    state: str
    street: str
    is_verified: bool
    capacity: int
    row_count: int
    column_count: int
    