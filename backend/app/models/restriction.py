from pydantic import BaseModel
from uuid import UUID

class Restriction(BaseModel):
    restriction_id: UUID
    alcohol: bool
    smoke: bool
    age: int
    max_ticket: int