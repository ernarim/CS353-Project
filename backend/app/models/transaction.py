from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class Transaction(BaseModel):
    transaction_id: UUID
    organizer_id: UUID
    buyer_id: UUID
    transaction_date: datetime
    amount: float
