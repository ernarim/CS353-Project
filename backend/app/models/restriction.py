from pydantic import BaseModel
from uuid import UUID

class RestrictionCreate(BaseModel):
    alcohol: bool
    smoke: bool
    age: int
    max_ticket: int

class Restriction(BaseModel):
    restriction_id: UUID
    alcohol: bool
    smoke: bool
    age: int
    max_ticket: int