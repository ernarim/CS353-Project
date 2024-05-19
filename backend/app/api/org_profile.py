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


        reports = []
        cursor.execute("""
            SELECT r.report_id, r.date, r.organizer_id, 
                    r. organizer_statistics, r.participant_statistics,
                    r.age_statistics, r.revenue_statistics
            FROM report r
            WHERE r.organizer_id = %s
        """, (str(user_id),))
        reports_data = cursor.fetchall()
        for report in reports_data:
            reports.append({
                "report_id": report['report_id'],
                "date": report['date'],
                "organizer_id": report['organizer_id'],
                "organizer_statistics": report['organizer_statistics'],
                "participant_statistics": report['participant_statistics'],
                "age_statistics": report['age_statistics'],
                "revenue_statistics": report['revenue_statistics']
            })


        events = []
        cursor.execute("""
            SELECT 
                e.event_id, e.name, e.date,
                e.is_done, e.is_cancelled, e.remaining_seat_no
            FROM event e                
            WHERE e.organizer_id = %s
        """, (str(user_id),))
        events_data = cursor.fetchall()

        for event in events_data:
            events.append({
                "event_id": event['event_id'],
                "name": event['name'],
                "date": event['date'],
                "is_done": event['is_done'],
                "is_cancelled": event['is_cancelled'],
                "remaining_seat_no": event['remaining_seat_no']
            })
   
        venues = []
        cursor.execute("""
            SELECT v.venue_id, v.name, v.city, v.state,
            v.street, v.status, v.capacity
            FROM venue v
            WHERE v.requester_id = %s
        """, (str(user_id),))
        venue_data = cursor.fetchall()
        for venue in venue_data:
            venues.append({
                "venue_id": venue['venue_id'],
                "name": venue['name'],
                "city": venue['city'],
                "state": venue['state'],
                "street": venue['street'],
                "status": venue['status'],
                "capacity": venue['capacity']
            })

        profile_data = {
            "user": uuser.model_dump(),
            "reports": reports,
            "events": events,
            "venues": venues
        }
        

        return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
