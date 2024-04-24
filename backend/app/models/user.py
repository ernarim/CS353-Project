from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID

class User(BaseModel):
    user_id: UUID
    password: str
    email: str
    phone: str
    last_login: datetime

class TicketBuyer(BaseModel):
    user_id: UUID
    balance: float
    birth_date: datetime
    name: str
    surname: str
    current_cart: UUID
    ticket_list: List[int] = []

class EventOrganizer(BaseModel):
    user_id: UUID
    organizer_name: str

class Admin(BaseModel):
    user_id: UUID
    group_privilige: str