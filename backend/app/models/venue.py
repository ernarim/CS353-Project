from pydantic import BaseModel
from uuid import UUID

class Venue(BaseModel):
    venue_id: UUID
    name: str
    city: str
    state: str
    street: str = None 
    is_verified: bool = False
    capacity: int = None
    row_count: int = None
    column_count: int = None
    