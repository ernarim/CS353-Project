from pydantic import BaseModel
from uuid import UUID

class Seats(BaseModel):
    row: int
    column: int

