from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
from app.database.session import cursor, conn
from app.models.venue import Venue, LocReq
from app.models.user import EventOrganizer, TicketBuyer
from uuid import UUID
from typing import List
from psycopg2.extras import DictCursor, RealDictCursor
router = APIRouter()

@router.get("/location_requests", response_model=List[Venue])
async def list_location_requests():
    query = """
    SELECT v.venue_id, v.requester_id, v.name, v.city, v.state, v.street, v.status, v.capacity, v.row_count, v.column_count, eo.name as organizer_name
    FROM Venue v
    JOIN event_organizer eo ON v.requester_id = eo.user_id
    WHERE v.status = 'pending';
    """
    try:
        cursor.execute(query)
        venue_records = cursor.fetchall()
        venues = [Venue(
            venue_id=record['venue_id'],
            requester_id=record['requester_id'],
            name=record['name'],
            city=record['city'],
            state=record['state'],
            street=record.get('street'),
            status=record['status'],
            capacity=record.get('capacity'),
            row_count=record['row_count'],
            column_count=record['column_count'],
            organizer_name=record['organizer_name']
        ) for record in venue_records]
        return venues
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/verified_venues", response_model=List[Venue])
async def list_verified_locations():
    query = """
    SELECT venue_id, requester_id, name, city, state, street, status, capacity, row_count, column_count
    FROM Venue
    WHERE status = 'verified';
    """
    try:
        cursor.execute(query)
        venue_records = cursor.fetchall()
        venues = [Venue(
            venue_id=record['venue_id'],
            requester_id = ['requester_id'],
            name=record['name'],
            city=record['city'],
            state=record['state'],
            street=record['street'],
            status=record['status'],
            capacity=record['capacity'],
            row_count=record['row_count'],
            column_count=record['column_count']
        ) for record in venue_records]
        return venues
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.patch("/verify/{venue_id}", response_model=Venue)
async def verify_venue(venue_id: UUID):
    query = """
    UPDATE Venue
    SET status = 'verified'
    WHERE venue_id = %s
    RETURNING *;
    """
    try:
        cursor.execute(query, (str(venue_id),))
        updated_venue = cursor.fetchone()
        if not updated_venue:
            raise HTTPException(status_code=404, detail="Venue not found")
        return Venue(**{
            'venue_id': updated_venue['venue_id'],
            'requester_id' : updated_venue['requester_id'],
            'name': updated_venue['name'],
            'city': updated_venue['city'],
            'state': updated_venue['state'],
            'street': updated_venue['street'],
            'status': updated_venue['status'],
            'capacity': updated_venue['capacity'],
            'row_count': updated_venue['row_count'],
            'column_count': updated_venue['column_count']
        })
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.patch("/reject/{venue_id}", response_model=Venue)
async def reject_venue(venue_id: UUID):
    query = """
    UPDATE Venue
    SET status = 'rejected'
    WHERE venue_id = %s
    RETURNING *;
    """
    try:
        cursor.execute(query, (str(venue_id),))
        updated_venue = cursor.fetchone()
        if not updated_venue:
            raise HTTPException(status_code=404, detail="Venue not found")
        return Venue(**{
            'venue_id': updated_venue['venue_id'],
            'requester_id' : updated_venue['requester_id'],
            'name': updated_venue['name'],
            'city': updated_venue['city'],
            'state': updated_venue['state'],
            'street': updated_venue['street'],
            'status': updated_venue['status'],
            'capacity': updated_venue['capacity'],
            'row_count': updated_venue['row_count'],
            'column_count': updated_venue['column_count']
        })
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/event_organizers", response_model=List[EventOrganizer])
async def list_all_event_organizers():
    query = "SELECT user_id, organizer_name, balance FROM Event_Organizer;"
    try:
        cursor.execute(query)
        records = cursor.fetchall()
        return [EventOrganizer(**record) for record in records]
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket_buyers", response_model=List[TicketBuyer])
async def list_all_ticket_buyers():
    query = "SELECT user_id, balance, birth_date, current_cart FROM Ticket_Buyer;"
    try:
        cursor.execute(query)
        records = cursor.fetchall()
        return [TicketBuyer(**record) for record in records]
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/organizer_info/{user_id}")
async def get_organizer_info(user_id: UUID):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # Fetch total revenue, organizer name, and balance
            revenue_query = """
            SELECT eo.organizer_name, eo.balance AS current_balance, COALESCE(SUM(t.amount), 0) AS total_revenue
            FROM Event_Organizer eo
            LEFT JOIN Transaction t ON eo.user_id = t.organizer_id
            WHERE eo.user_id = %s
            GROUP BY eo.user_id
            """
            cursor.execute(revenue_query, (str(user_id),))
            organizer_info = cursor.fetchone()

            if not organizer_info:
                raise HTTPException(status_code=404, detail="Organizer not found")

            # Fetch number of sold and unsold tickets
            ticket_query = """
            SELECT 
                COUNT(CASE WHEN is_sold = TRUE THEN 1 END) AS sold_tickets,
                COUNT(CASE WHEN is_sold = FALSE THEN 1 END) AS unsold_tickets
            FROM Ticket
            WHERE event_id IN (SELECT event_id FROM Event WHERE organizer_id = %s)
            """
            cursor.execute(ticket_query, (str(user_id),))
            ticket_info = cursor.fetchone()

            if not ticket_info:
                ticket_info = {"sold_tickets": 0, "unsold_tickets": 0}

            result = {
                "organizer_id": user_id,
                "organizer_name": organizer_info["organizer_name"],
                "current_balance": organizer_info["current_balance"],
                "total_revenue": organizer_info["total_revenue"],
                "sold_tickets": ticket_info["sold_tickets"],
                "unsold_tickets": ticket_info["unsold_tickets"]
            }
            return result

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))   