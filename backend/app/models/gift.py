from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

class Gift(BaseModel):
    gift_id: UUID
    gift_msg: str
    gift_date: datetime
    receiver_mail: str
    