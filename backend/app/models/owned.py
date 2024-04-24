from pydantic import BaseModel
from uuid import UUID

class Owned(BaseModel):
    user_id: UUID
    cart_id: UUID
    