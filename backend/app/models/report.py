from pydantic import BaseModel
from uuid import UUID

class Report(BaseModel):
    report_id: UUID
    admin_id: UUID
    name: str
    description: str
    