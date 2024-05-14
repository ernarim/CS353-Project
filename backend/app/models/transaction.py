from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID
from typing import List

class TransactionItem(BaseModel):
    ticket_id: UUID
    event_id: UUID
    organizer_id: UUID
    buyer_id: UUID
    amount: float
    email: str = None

class TransactionList(BaseModel):
    transactions: List[TransactionItem]

class Transaction(BaseModel):
    organizer_id: UUID
    buyer_id: UUID
    amount: float
