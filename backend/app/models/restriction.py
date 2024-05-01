from pydantic import BaseModel
from uuid import UUID
from typing import Optional
class RestrictionCreate(BaseModel):
    alcohol: Optional[bool] = False
    smoke: Optional[bool] = False
    age: Optional[int] = 0
    max_ticket: Optional[int] = 0

class Restriction(BaseModel):
    restriction_id: UUID
    alcohol: bool
    smoke: bool
    age: int
    max_ticket: int