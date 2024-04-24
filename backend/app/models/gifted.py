from pydantic import BaseModel
from uuid import UUID

class Gifted(BaseModel):
    gift_id: UUID
    cart_id: UUID
    