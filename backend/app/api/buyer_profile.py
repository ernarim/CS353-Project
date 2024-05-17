from typing import Dict, Any
from app.database.session import conn
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException
from app.models.user import TicketBuyer
from uuid import UUID

router = APIRouter()

@router.get("/buyer_profile/{user_id}", response_model=Dict[str, Any])
async def get_buyer_profile(user_id: UUID):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT u.user_id, u.email, u.phone, u.last_login, u.password, tb.name, tb.surname, tb.balance, tb.birth_date, tb.current_cart 
            FROM users u
            JOIN ticket_buyer tb ON u.user_id = tb.user_id
            WHERE u.user_id = %s
        """, (str(user_id),))
        user_data = cursor.fetchone()

    
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        
        cursor.execute("""
            SELECT 
                t.ticket_id, 
                tc.price, 
                ev.name as cat_name,
                e.event_id, 
                e.name as event_name, 
                e.date as event_date, 
                e.description as event_description,
                e.return_expire_date,
                e.is_done, 
                e.is_cancelled, 
                eo.organizer_name
            FROM ticket_list tl
            JOIN ticket t ON tl.ticket_id = t.ticket_id
            JOIN event e ON t.event_id = e.event_id
            JOIN event_category ev ON ev.category_id = e.category_id           
            JOIN event_organizer eo ON e.organizer_id = eo.user_id
            JOIN ticket_category tc ON t.event_id = tc.event_id         
            WHERE tl.user_id = %s
        """, (str(user_id),))
        tickets_data = cursor.fetchall()
        
        tickets = []
        for ticket in tickets_data:
            ticket_info = {
                "ticket_id": ticket['ticket_id'],
                "event_id": ticket['event_id'],
                "price": ticket['price'],
                "category_name": ticket['cat_name']
            }
            event_info = {
                "event_name": ticket["event_name"],
                "event_id": ticket['event_id'],
                "event_date": ticket["event_date"],
                "is_done": ticket["is_done"],
                "is_cancelled": ticket["is_cancelled"],
                "organizer_name": ticket["organizer_name"],
                "return_expire_date": ticket["return_expire_date"]
            }
            tickets.append({"ticket_info": ticket_info, "event_info": event_info})

        uuser = TicketBuyer(
            user_id=user_data['user_id'],
            password="",
            email=user_data['email'],
            phone=user_data['phone'],
            last_login=user_data['last_login'],
            balance=user_data['balance'],
            birth_date=user_data['birth_date'],
            name=user_data['name'],
            surname=user_data['surname'],
            current_cart=user_data['current_cart'],
            ticket_list=[]
        )

        profile_data = {
            "user": uuser.model_dump(),
            "tickets": tickets
        }

        return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()

