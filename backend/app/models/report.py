from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class Report(BaseModel):
    report_id: UUID
    date: str
    organizer_id: UUID
    organizer_statistics: Optional[dict]
    participant_statistics: Optional[dict]
    age_statistics: Optional[dict]
    revenue_statistics: Optional[dict]
    
class ReportCreate(BaseModel):
    date: str
    organizer_id: UUID
    organizer_statistics: Optional[dict]
    participant_statistics: Optional[dict]
    age_statistics: Optional[dict]
    revenue_statistics: Optional[dict]