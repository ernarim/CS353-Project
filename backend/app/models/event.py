from pydantic import BaseModel
from datetime import datetime
from fastapi import UploadFile
from uuid import UUID
from typing import Optional
from .restriction import Restriction, RestrictionCreate
from .user import EventOrganizer
from .venue import Venue
from .event_category import EventCategory

class Event(BaseModel):
    event_id: UUID
    name: str
    date: datetime
    description: str
    is_done: bool
    remaining_seat_no: Optional[int] = None
    return_expire_date: Optional[datetime] = None
    organizer_id: UUID
    venue_id: UUID
    category_id: UUID
    restriction : Optional[Restriction] = None

class EventCreate(BaseModel):
    name: str
    date: datetime
    description: Optional[str] = None
    is_done: Optional[bool] = False
    remaining_seat_no: Optional[int] = None
    return_expire_date: Optional[datetime] = None
    organizer_id: UUID
    venue_id: UUID
    category_id: UUID
    restriction : Optional[RestrictionCreate] = None
    photo: Optional[str]
    

class EventRead(BaseModel):
    event_id: UUID
    name: str
    date: datetime
    description: str
    is_done: bool
    remaining_seat_no: Optional[int] = None
    return_expire_date: Optional[datetime] = None
    organizer: Optional[EventOrganizer] = None
    venue: Optional[Venue] = None
    category: Optional[EventCategory] = None
    restriction : Optional[Restriction] = None

    
