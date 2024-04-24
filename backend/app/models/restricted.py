from pydantic import BaseModel
from uuid import UUID

class Restricted(BaseModel):
    restriction_id: UUID
    event_id: UUID
    