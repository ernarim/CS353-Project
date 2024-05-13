from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
from app.database.session import cursor, conn
from app.models.venue import Venue
from app.models.user import EventOrganizer, TicketBuyer
from uuid import UUID
from typing import List
router = APIRouter()


@router.get("/location_requests", response_model=List[Venue])
async def list_location_requests():
    query = """
    SELECT venue_id, requester_id, name, city, state, street, status, capacity, row_count, column_count
    FROM Venue
    WHERE status = 'pending';
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
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/event_organizers", response_model=List[EventOrganizer])
async def list_all_event_organizers():
    query = "SELECT user_id, organizer_name, balance FROM Event_Organizer;"
    try:
        cursor.execute(query)
        records = cursor.fetchall()
        return [EventOrganizer(**record) for record in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ticket_buyers", response_model=List[TicketBuyer])
async def list_all_ticket_buyers():
    query = "SELECT user_id, balance, birth_date, current_cart FROM Ticket_Buyer;"
    try:
        cursor.execute(query)
        records = cursor.fetchall()
        return [TicketBuyer(**record) for record in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))