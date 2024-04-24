from pydantic import BaseModel
from uuid import UUID

class Seats(BaseModel):
    row_number: int
    column_number: int
    venue_id: UUID
