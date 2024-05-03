from fastapi import APIRouter, Query
from app.database.session import cursor, conn
from app.models.event import Event, EventRead, EventCreate
from app.models.restriction import Restriction
from app.api.restriction import create_restriction, read_restriction, delete_restriction_by_event_id
from fastapi import HTTPException
from uuid import UUID, uuid4
from psycopg2.errors import ForeignKeyViolation
from typing import List, Dict, Optional
import logging
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter()

def check_foreign_key(table, column, value):
    """ Check if a specific value exists for a column in a table """
    cursor.execute(f"SELECT EXISTS(SELECT 1 FROM {table} WHERE {column} = %s)", (value,))
    return cursor.fetchone()[0]

async def read_restriction(event_id: str):
    cursor.execute("SELECT restriction_id FROM Restricted WHERE event_id = %s", (event_id,))
    restriction_id = cursor.fetchone()
    if restriction_id is None:
        return None
    restriction_id = restriction_id[0]
    cursor.execute("SELECT * FROM Restriction WHERE restriction_id = %s", (restriction_id,))
    restriction = cursor.fetchone()
    restriction = {
        "restriction_id": restriction[0],
        "alcohol": restriction[1],
        "smoke": restriction[2],
        "age": restriction[3],
        "max_ticket": restriction[4]
    }
    return restriction


@router.get("")
async def get_all_events():
    query = """
    SELECT 
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name, 
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.is_verified, v.capacity, v.row_count, v.column_count,
        e.category_id, c.name AS category_name
    FROM Event e
    JOIN Event_Organizer o ON e.organizer_id = o.user_id
    JOIN Venue v ON e.venue_id = v.venue_id
    JOIN Event_Category c ON e.category_id = c.category_id
    """
    cursor.execute(query)
    events = cursor.fetchall()
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
    # Asynchronously prepare event data for all events
    prepared_events = await asyncio.gather(*[prepare_event_data(event) for event in events])
    return prepared_events

@router.get("/{event_id}")
async def read_event(event_id: UUID):
    query = """
    SELECT 
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name, 
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.is_verified, v.capacity, v.row_count, v.column_count,
        e.category_id, c.name AS category_name
    FROM Event e
    JOIN Event_Organizer o ON e.organizer_id = o.user_id
    JOIN Venue v ON e.venue_id = v.venue_id
    JOIN Event_Category c ON e.category_id = c.category_id
    WHERE e.event_id = %s;

    """
    cursor.execute(query, (str(event_id),))
    event = cursor.fetchone()
    logger.info(f"Event: {event}")

    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    event_data = {
        "event_id": event[0],
        "name": event[1],
        "date": event[2],
        "description": event[3],
        "is_done": event[4],
        "remaining_seat_no": event[5],
        "return_expire_date": event[6],
        "organizer": {
            "organizer_id": event[7],
            "organizer_name": event[8]
        },
        "venue": {
            "venue_id": event[9],
            "name": event[10],
            "city": event[11],
            "state": event[12],
            "street": event[13],
            "is_verified": event[14],
            "capacity": event[15],
            "row_count": event[16],
            "column_count": event[17]
        },
        "category": {
            "category_id": event[18],
            "category_name": event[19]
        },
        "restriction": await read_restriction(str(event[0]))
    }
   
    return event_data


@router.post("create")
async def create_event(event: EventCreate):
    event_id = uuid4()
    if not check_foreign_key("event_category", "category_id", str(event.category_id)):
        raise HTTPException(status_code=404, detail=f"Category ID {event.category_id} not found")

    if not check_foreign_key("event_organizer", "user_id", str(event.organizer_id)):
        raise HTTPException(status_code=404, detail=f"Organizer ID {event.organizer_id} not found")

    if not check_foreign_key("venue", "venue_id", str(event.venue_id)):
        raise HTTPException(status_code=404, detail=f"Venue ID {event.venue_id} not found")

    query = """
    INSERT INTO Event (event_id, name, date, description, is_done, remaining_seat_no, return_expire_date, organizer_id, venue_id, category_id)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING *;
    """
    try:
        cursor.execute(query, (str(event_id), event.name, event.date, event.description, event.is_done,
                               event.remaining_seat_no, event.return_expire_date, str(event.organizer_id),
                                str(event.venue_id), str(event.category_id)))
        new_event = cursor.fetchone()
  
        new_event_data = {
            "event_id": new_event[0],
            "name": new_event[1],
            "date": new_event[2],
            "description": new_event[3],
            "is_done": new_event[4],
            "remaining_seat_no": new_event[5],
            "return_expire_date": new_event[6],
            "organizer_id": new_event[7],
            "venue_id": new_event[8],
            "category_id": new_event[9],
            "restriction": event.restriction
        }
        conn.commit()


        restriction = await create_restriction(event.restriction, str(event_id))

        #return both new event and restriction
        return new_event_data, restriction
        
    except ForeignKeyViolation as e:
        conn.rollback()
        logger.error(f"ForeignKeyViolation: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        conn.rollback()
        logger.error(f"Unhandled exception: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")

@router.patch("/{event_id}", response_model=Event)
async def update_event(event_id: UUID, update_data: Event):
    query = """
    UPDATE Event SET name = %s, date = %s, description = %s, is_done = %s, remaining_seat_no = %s, return_expire_date = %s, organizer_id = %s, venue_id = %s, category_id = %s
    WHERE event_id = %s RETURNING *;
    """
    cursor.execute(query, (update_data.name, update_data.date, update_data.description, update_data.is_done,
                           update_data.remaining_seat_no, update_data.return_expire_date, update_data.organizer_id,
                           update_data.venue_id, update_data.category_id, str(event_id)))
    updated_event = cursor.fetchone()
    conn.commit()
    if updated_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated_event



@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: UUID):

    deleleted_restriction = await delete_restriction_by_event_id(str(event_id))

    cursor.execute("DELETE FROM Event WHERE event_id = %s RETURNING *;", (str(event_id),))
    deleted_event = cursor.fetchone()
    conn.commit()
    if deleted_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return {"detail": "Event deleted successfully"}


@router.get("/search_events", response_model=List[Event])
async def search_events(name: Optional[str] = Query(None, description="Search by event name")):
    query = """
    SELECT 
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name, 
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.is_verified, v.capacity, v.row_count, v.column_count,
        e.category_id, c.name AS category_name
    FROM Event e
    JOIN Event_Organizer o ON e.organizer_id = o.user_id
    JOIN Venue v ON e.venue_id = v.venue_id
    JOIN Event_Category c ON e.category_id = c.category_id
    """
    # Eğer bir isim query'si varsa, WHERE koşulunu sorguya ekleyin
    if name:
        query += " WHERE e.name ILIKE %s"
        name_pattern = f"%{name}%"
        cursor.execute(query, (name_pattern,))
    else:
        cursor.execute(query)

    events = cursor.fetchall()
    if not events:
        raise HTTPException(status_code=404, detail="No events found")

    prepared_events = [prepare_event_data(event) for event in events]
    return prepared_events

# Prepare each event's data including the restriction (asynchronously fetched)
async def prepare_event_data(event):
    event_dict = {
        "event_id": event[0],
        "name": event[1],
        "date": event[2],
        "description": event[3],
        "is_done": event[4],
        "remaining_seat_no": event[5],
        "return_expire_date": event[6],
        "organizer": {
            "organizer_id": event[7],
            "organizer_name": event[8]
        },
        "venue": {
            "venue_id": event[9],
            "name": event[10],
            "city": event[11],
            "state": event[12],
            "street": event[13],
            "is_verified": event[14],
            "capacity": event[15],
            "row_count": event[16],
            "column_count": event[17]
        },
        "category": {
            "category_id": event[18],
            "category_name": event[19]
        }
    }
    # Fetch restriction asynchronously
    event_dict["restriction"] = await read_restriction(str(event[0]))
    return event_dict
