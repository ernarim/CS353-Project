from pydantic import BaseModel
from uuid import UUID
from typing import List

class Venue(BaseModel):
    venue_id: UUID
    name: str
    city: str
    state: str
    street: str = None
    is_verified: bool = False
    capacity: int = None
    row_count: int
    column_count: int
    seats: List[List[int]] = None

class VenueCreate(BaseModel):
    name: str
    city: str
    state: str
    street: str = None
    capacity: int = None
    row_count: int = None
    column_count: int = None
    seats: List[List[int]] = None