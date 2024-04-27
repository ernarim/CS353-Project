from pydantic import BaseModel
from uuid import UUID

class EventCategory(BaseModel):
    category_id: UUID
    name: str
    
class EventCategoryCreate(BaseModel):
    name: str