from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from uuid import UUID


class User(BaseModel):
    user_id: UUID
    password: str
    email: str
    phone: Optional[str]
    last_login: Optional[datetime]

class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    password: str
    email: str
    phone: Optional[str]

class TicketBuyer(User):
    user_id: UUID
    balance: float
    birth_date: datetime
    name: str
    surname: str
    current_cart: UUID
    ticket_list: List[int] = []

class TicketBuyerCreate(UserCreate):
    balance: float = 0.0
    birth_date: datetime
    name: str
    surname: str

class EventOrganizer(User):
    user_id: UUID
    balance: float = 0.0
    organizer_name: str

class EventOrganizerCreate(UserCreate):
    organizer_name: str

class Admin(User):
    user_id: UUID
    group_privilige: str

class AdminCreate(UserCreate):
    group_privilige: str