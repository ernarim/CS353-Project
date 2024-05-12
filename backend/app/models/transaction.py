from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class Transaction(BaseModel):
    organizer_id: UUID
    buyer_id: UUID
    amount: float
