from pydantic import BaseModel
from uuid import UUID


class TicketList(BaseModel):
    user_id: UUID
    ticket_id: UUID
    