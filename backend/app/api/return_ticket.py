from fastapi import HTTPException, APIRouter, Path
from typing import Dict, Any
from uuid import UUID
from app.database.session import conn
router = APIRouter()

@router.get("/return_ticket/{ticket_id}")
async def return_ticket(ticket_id: UUID):
    
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT event_id FROM ticket
            WHERE ticket_id = %s;
        """, (str(ticket_id),))
        event_id = cursor.fetchone()[0]

        cursor.execute("""
            SELECT organizer_id FROM event
            WHERE event_id = %s;
        """, (str(event_id),))
        org_id = cursor.fetchone()[0]

        cursor.execute("""
            SELECT user_id FROM ticket_list
            WHERE ticket_id = %s;
        """, (str(ticket_id),))
        user_id = cursor.fetchone()[0]

        cursor.execute("""
            SELECT category_name FROM seating_plan WHERE ticket_id = %s;
        """, (str(ticket_id),))
        category_name = cursor.fetchone()[0]

        cursor.execute("""
            SELECT price FROM ticket_category WHERE event_id = %s AND category_name = %s;
        """, (str(event_id), category_name))
        price = cursor.fetchone()[0]
        
        if not event_id or not org_id or not user_id or not category_name or not price:
            raise ValueError("Required information not found")
    

        cursor.execute("""
            UPDATE ticket SET is_sold = FALSE WHERE ticket_id = %s;
        """, (str(ticket_id),))

        cursor.execute("""
            UPDATE event SET remaining_seat_no = remaining_seat_no + 1
            WHERE event_id = %s;
        """, (str(event_id),))

        cursor.execute("""
            DELETE FROM ticket_list WHERE ticket_id = %s;
        """, (str(ticket_id),))

        cursor.execute("""
            UPDATE seating_plan SET is_available = TRUE
            WHERE ticket_id = %s;
        """, (str(ticket_id),))

        cursor.execute("""
            UPDATE ticket_buyer SET balance = balance + %s WHERE user_id = %s;
        """, (price, str(user_id)))

        cursor.execute("""
            UPDATE event_organizer SET balance = balance - %s 
            WHERE user_id = %s AND balance >= %s;
        """, (price, str(org_id), price))

        conn.commit()  # Commit the transaction
        return {"detail": "Ticket returned successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
