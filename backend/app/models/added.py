from pydantic import BaseModel
from uuid import UUID

class Added(BaseModel):
    cart_id: UUID
    ticket_id: UUID
    