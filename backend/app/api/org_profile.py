from typing import Dict, Any
from app.database.session import conn
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException
from app.models.user import EventOrganizer
from uuid import UUID

router = APIRouter()

@router.get("/org_profile/{user_id}", response_model=Dict[str, Any])
async def get_org_profile(user_id: UUID):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT u.user_id, u.email, u.phone, u.last_login, u.password, eo.organizer_name, eo.balance
            FROM users u
            JOIN event_organizer eo ON u.user_id = eo.user_id
            WHERE u.user_id = %s
        """, (str(user_id),))
        user_data = cursor.fetchone()
    
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        uuser = EventOrganizer(
            user_id=user_data['user_id'],
            password="",
            email=user_data['email'],
            phone=user_data['phone'],
            last_login=user_data['last_login'],
            balance=user_data['balance'],
            organizer_name=user_data['organizer_name']
        )


        # Reports (if the Organizer is also an Admin)
        reports = []
        cursor.execute("""
            SELECT r.report_id, r.name, r.description
            FROM report r
            WHERE r.admin_id = %s
        """, (str(user_id),))
        reports_data = cursor.fetchall()
        for report in reports_data:
            reports.append({
                "report_id": report['report_id'],
                "name": report['name'],
                "description": report['description']
            })


        events = []
        cursor.execute("""
            SELECT 
                e.event_id, e.name, e.date, e.description, e.return_expire_date,
                e.is_done, e.is_cancelled, e.remaining_seat_no,
                v.name as venue, v.capacity as capacity, ec.name as category,
                res.alcohol, res.smoke, res.age, res.max_ticket
            FROM event e
            JOIN venue v ON v.requester_id = e.organizer_id   
            JOIN event_category ec ON ec.category_id = e.category_id  
            JOIN restricted rted ON rted.event_id = e.event_id
            JOIN restriction res ON res.restriction_id = rted.restriction_id                 
            WHERE e.organizer_id = %s
        """, (str(user_id),))
        events_data = cursor.fetchall()

        for event in events_data:
            event_id = event['event_id']
            ticket_buyers = []
            
            cursor.execute("""
            SELECT sp.category_name, tb.name, tb.surname, ttc.price
            FROM ticket_buyer tb
            JOIN ticket_list tl ON tb.user_id = tl.user_id
            JOIN ticket t ON tl.ticket_id = t.ticket_id
            JOIN seating_plan sp ON t.ticket_id = sp.ticket_id
            JOIN ticket_category ttc ON ttc.category_name = sp.category_name
            WHERE 
                t.event_id = %s
            """, (str(event_id),))
            buyers_data = cursor.fetchall()

            for buyer in buyers_data:
                ticket_buyers.append({
                    "name": buyer['name'],
                    "surname": buyer['surname'],
                    "price": buyer['price'],
                    "category_name": buyer['category_name']
                })

            events.append({
                "name": event['name'],
                "date": event['date'],
                "description": event['description'],
                "is_done": event['is_done'],
                "is_cancelled": event['is_cancelled'],
                "venue_name": event['venue'],
                "venue_capacity": event['capacity'],
                "category":event['category'],
                "remaining_seat_no": event['remaining_seat_no'],
                "return_expire_date": event['return_expire_date'],
                "alcohol": event['alcohol'], 
                "smoke": event['smoke'], 
                "age": event['age'], 
                "max_ticket": event['max_ticket'],
                "ticket_buyers": ticket_buyers
            })
   

        profile_data = {
            "user": uuser.model_dump(),
            "reports": reports,
            "events": events
        }

        return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
