from pydantic import BaseModel
from uuid import UUID

class Cart(BaseModel):
    cart_id: UUID
    is_gift: bool
    