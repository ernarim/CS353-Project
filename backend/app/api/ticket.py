from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.ticket import Ticket
from fastapi import HTTPException
from uuid import UUID
from typing import List
router = APIRouter()

@router.get("/{event_id}/total_sold_tickets")
async def get_total_sold_tickets(event_id: UUID):
    print("log0 %s", event_id)
    try:
        # Execute SQL query to count the number of sold tickets for the given event_id
        cursor.execute("SELECT COUNT(*) FROM Ticket WHERE event_id = %s AND is_sold = TRUE", (str(event_id),))
        total_sold_tickets = cursor.fetchone()[0]
        return total_sold_tickets
    except Exception as e:
        # Handle any exceptions or errors that occur during database query
        raise HTTPException(status_code=500, detail=f"Failed to get total sold tickets: {str(e)}")
    


    