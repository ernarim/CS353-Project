from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
import psycopg2
from app.database.session import cursor, conn
from app.models.venue import Venue, LocReq
from app.models.user import EventOrganizer, TicketBuyer
from app.models.event import EventRevenueDetails
from uuid import UUID
from typing import List
from psycopg2.extras import DictCursor, RealDictCursor
router = APIRouter()

@router.get("/location_requests", response_model=List[LocReq])
async def list_location_requests():
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    query = """
    SELECT v.venue_id, v.requester_id, v.name, v.city, v.state, v.street, v.status, v.capacity, v.row_count, v.column_count, eo.organizer_name as organizer_name
    FROM Venue v
    JOIN event_organizer eo ON v.requester_id = eo.user_id
    WHERE v.status = 'pending';
    """
    try:
        cursor.execute(query)
        venue_records = cursor.fetchall()
        venues = [LocReq(
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
    

@router.patch("/verify/{venue_id}")
async def verify_venue(venue_id: str):
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
        conn.commit()
        return updated_venue
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.patch("/reject/{venue_id}")
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
        conn.commit()
        return updated_venue
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/event_organizers")
async def list_all_event_organizers():
    query = """
        SELECT eo.user_id, eo.organizer_name, eo.balance, u.phone, u.email
        FROM Event_Organizer eo
        JOIN Users u ON eo.user_id = u.user_id;
    """

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            records = cursor.fetchall()
            event_organizers = [
                {
                    "user_id": record["user_id"],
                    "organizer_name": record["organizer_name"],
                    "balance": float(record["balance"]),
                    "phone": record["phone"],
                    "email": record["email"]
                }
                for record in records
            ]
            return event_organizers
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ticket_buyers")
async def list_all_ticket_buyers():
    query = """
        SELECT tb.user_id, tb.balance, tb.birth_date, tb.name, tb.surname, u.phone, u.email
        FROM Ticket_Buyer tb
        JOIN Users u ON tb.user_id = u.user_id;
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query)
            records = cursor.fetchall()
            ticket_buyers = [
                {
                    "user_id": record["user_id"],
                    "balance": float(record["balance"]),
                    "birth_date": record["birth_date"],
                    "name": record["name"],
                    "surname": record["surname"],
                    "phone": record["phone"],
                    "email": record["email"]
                }
                for record in records
            ]
            return ticket_buyers
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    

@router.get("/organizer_info/{user_id}")
async def get_organizer_info(user_id: UUID):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            
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

            event_count_query = """
            SELECT COUNT(*) AS total_events
            FROM Event
            WHERE organizer_id = %s
            """
            cursor.execute(event_count_query, (str(user_id),))
            event_count_info = cursor.fetchone()

            if not event_count_info:
                event_count_info = {"total_events": 0}

            result = {
                "organizer_id": user_id,
                "organizer_name": organizer_info["organizer_name"],
                "current_balance": organizer_info["current_balance"],
                "total_revenue": organizer_info["total_revenue"],
                "sold_tickets": ticket_info["sold_tickets"],
                "unsold_tickets": ticket_info["unsold_tickets"],
                "total_events": event_count_info["total_events"]
            }
            return result
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/organizer/{user_id}/min_max_revenue_events", response_model=List[EventRevenueDetails])
async def get_min_max_revenue_events(user_id: UUID):
    query = """
        WITH EventStats AS (
        SELECT
            e.event_id,
            e.name,
            e.date,
            COUNT(DISTINCT CASE WHEN t.is_sold THEN t.ticket_id ELSE NULL END) AS total_sold_tickets,
            COUNT(DISTINCT CASE WHEN NOT t.is_sold THEN t.ticket_id ELSE NULL END) AS total_unsold_tickets,
            COALESCE(SUM(tr.amount/ 100.0), 0) AS revenue
        FROM
            Event e
            LEFT JOIN Ticket t ON e.event_id = t.event_id
            LEFT JOIN Transaction tr ON e.event_id = tr.event_id
        WHERE
            e.organizer_id = %s
        GROUP BY
            e.event_id, e.name, e.date
        )
        SELECT * FROM EventStats
        WHERE revenue = (SELECT MIN(revenue) FROM EventStats)
        OR revenue = (SELECT MAX(revenue) FROM EventStats)
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (str(user_id),))
            records = cursor.fetchall()
            min_max_revenue_events = [
                {
                    "name": record["name"],
                    "time": record["date"].isoformat(),
                    "total_sold_tickets": record["total_sold_tickets"],
                    "total_unsold_tickets": record["total_unsold_tickets"],
                    "revenue": float(record["revenue"])
                }
                for record in records
            ]
            return min_max_revenue_events
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
