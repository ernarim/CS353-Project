from pydantic import BaseModel
from uuid import UUID

class Report(BaseModel):
    report_id: UUID
    date: str
    balance: float
    organizer_id: UUID
    organizer_name: str
    sold_tickets: int
    unsold_tickets: int
    total_revenue: float
    total_events: int
    
class ReportCreate(BaseModel):
    date: str
    balance: float
    organizer_id: UUID
    organizer_name: str
    sold_tickets: int
    unsold_tickets: int
    total_revenue: float
    total_events: int