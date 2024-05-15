from datetime import datetime
from fastapi import APIRouter, Query
from app.database.session import cursor, conn, dictCursor
from app.models.event import Event, EventRead, EventCreate, EventUpdate
from app.models.restriction import Restriction
from app.api.restriction import create_restriction, read_restriction, delete_restriction_by_event_id, update_restriction
from fastapi import HTTPException
from uuid import UUID, uuid4
from psycopg2.errors import ForeignKeyViolation
from psycopg2.extras import DictCursor, RealDictCursor
from fastapi import APIRouter, HTTPException, UploadFile, File
import os
import shutil
import psycopg2
from starlette.responses import JSONResponse

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
async def get_all_events(name: Optional[str] = Query(None, description="Search by event name"),
    city: Optional[str] = Query(None, description="Filter by city"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date"),
    category_name: Optional[str] = Query(None, description="Filter by event category")
):
    query = """
    SELECT
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name,
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.status, v.capacity, v.row_count, v.column_count,
        e.category_id, c.name AS category_name, e.photo, e.is_cancelled, e.photo_plan
    FROM Event e
    JOIN Event_Organizer o ON e.organizer_id = o.user_id
    JOIN Venue v ON e.venue_id = v.venue_id
    JOIN Event_Category c ON e.category_id = c.category_id
    WHERE e.is_cancelled = false
    """
    params = []
    if name:
        query += " AND e.name ILIKE %s"
        params.append(f"%{name}%")
    if city:
        query += " AND v.city ILIKE %s"
        params.append(f"%{city}%")
    if start_date:
        query += " AND e.date >= %s"
        params.append(start_date)
    if end_date:
        query += " AND e.date <= %s"
        params.append(end_date)
    if category_name:
        query += " AND c.name = %s"
        params.append(category_name)

    try:
        cursor.execute(query, tuple(params))
        events = cursor.fetchall()
        if not events:
            return []
        # Asynchronously prepare event data for all events
        prepared_events = await asyncio.gather(*[prepare_event_data(event) for event in events])
        return prepared_events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{event_id}")
async def read_event(event_id: UUID):
    query = """
    SELECT
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name,
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.status, v.capacity, v.row_count, v.column_count,
        e.category_id, c.name AS category_name, e.photo, e.is_cancelled, e.photo_plan
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
            "status": event[14],
            "capacity": event[15],
            "row_count": event[16],
            "column_count": event[17]
        },
        "category": {
            "category_id": event[18],
            "category_name": event[19]
        },
        "restriction": await read_restriction(str(event[0])),
        "photo": event[20],
        "is_cancelled" : event[21],
        "photo_plan" : event[22]
    }

    return event_data


@router.post("")
async def create_event(event: EventCreate):
    event_id = uuid4()
    if not check_foreign_key("event_category", "category_id", str(event.category_id)):
        raise HTTPException(status_code=404, detail=f"Category ID {event.category_id} not found")

    if not check_foreign_key("event_organizer", "user_id", str(event.organizer_id)):
        raise HTTPException(status_code=404, detail=f"Organizer ID {event.organizer_id} not found")

    if not check_foreign_key("venue", "venue_id", str(event.venue_id)):
        raise HTTPException(status_code=404, detail=f"Venue ID {event.venue_id} not found")

    event_query = """
        INSERT INTO Event (event_id, name, date, description, is_done, remaining_seat_no, return_expire_date, organizer_id, venue_id, category_id, photo, photo_plan)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """


    ticket_category_query = """
        INSERT INTO Ticket_Category (event_id, category_name, price, color)
        VALUES (%s, %s, %s, %s)
        RETURNING *;
    """


    seating_plan_query = """
        INSERT INTO Seating_Plan (event_id, ticket_id, category_name, row_number, column_number, is_available, is_reserved)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
    """
    ticket_creation_query = """
        INSERT INTO Ticket (ticket_id, event_id, is_sold)
        VALUES (%s, %s, FALSE)
        RETURNING *;
    """
    try:

        cursor.execute(event_query, (str(event_id), event.name, event.date, event.description, event.is_done,
                               event.remaining_seat_no, event.return_expire_date, str(event.organizer_id),
                                str(event.venue_id), str(event.category_id), event.photo, event.photo_plan))
        new_event = cursor.fetchone()

        for category in event.ticket_categories:
            cursor.execute(ticket_category_query, (str(event_id), category.category_name, category.price, category.color))

        for plan in event.seating_plans:
            ticket_id = uuid4()
            cursor.execute(ticket_creation_query, (str(ticket_id), str(event_id)))
            new_ticket = cursor.fetchone()
            if not new_ticket:
                raise HTTPException(status_code=404, detail="Failed to create ticket")

            cursor.execute(seating_plan_query, (str(event_id), str(ticket_id), plan.category_name, plan.row_number, plan.column_number, True, False))

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


@router.patch("/{event_id}")
async def update_event(event_id: UUID, update_data: EventUpdate):
    query = """
    UPDATE Event SET
        name = %s,
        description = %s,
        photo = %s
    WHERE event_id = %s
    RETURNING *;
    """
    # Convert any UUIDs to strings before executing the query

    params = (
        update_data.name,
        update_data.description,
        update_data.photo,
        str(event_id)
    )

    with conn.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params)
        updated_event = cursor.fetchone()
        conn.commit()


    if updated_event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    return updated_event



@router.delete("/{event_id}", status_code=204)
async def delete_event(event_id: UUID):

    try:
        deleleted_restriction = await delete_restriction_by_event_id(str(event_id))


        cursor.execute("DELETE FROM Seating_Plan WHERE event_id = %s;", (str(event_id),))
        print(f"Deleted seating plans for event {event_id}")

        
        cursor.execute("DELETE FROM Ticket WHERE event_id = %s;", (str(event_id),))
        print(f"Deleted tickets for event {event_id}")
        
        cursor.execute("DELETE FROM Ticket_Category WHERE event_id = %s;", (str(event_id),))
        print(f"Deleted ticket categories for event {event_id}")

        cursor.execute("DELETE FROM Event WHERE event_id = %s RETURNING *;", (str(event_id),))
        deleted_event = cursor.fetchone()
        if deleted_event is None:
            raise HTTPException(status_code=404, detail="Event not found")

        conn.commit()
        return {"detail": "Event deleted successfully"}

    except psycopg2.DatabaseError as e:
        # If any of the deletions fail, roll back the transaction
        conn.rollback()
        logger.error(f"Failed to delete event: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete event: {e}")

@router.post("/cancel/{event_id}")
async def cancel_event(event_id: UUID):
    print("I am cancelling the event")

    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # Fetch all transactions for the event
        transaction_query = """
        SELECT transaction_id, buyer_id, amount, organizer_id
        FROM Transaction
        WHERE event_id = %s;
        """
        cursor.execute(transaction_query, (str(event_id),))
        transactions = cursor.fetchall()

        if not transactions:
            print("I am cancelling the event 4")
            cursor.execute("UPDATE Event SET is_cancelled = TRUE WHERE event_id = %s", (str(event_id),))
            conn.commit()
            return JSONResponse(status_code=200, content={"message": "No transactions available for this event, event successfully canceled"})

        # Refund each buyer and adjust the organizer's balance
        for transaction in transactions:
            # Refund the buyer
            cursor.execute("""
            UPDATE Ticket_Buyer
            SET balance = balance + %s
            WHERE user_id = %s;
            """, (transaction['amount'], str(transaction['buyer_id'])))

            # Deduct the amount from the organizer's balance
            cursor.execute("""
            UPDATE Event_Organizer
            SET balance = balance - %s
            WHERE user_id = %s;
            """, (transaction['amount'], str(transaction['organizer_id'])))

        cursor.execute("UPDATE Event SET is_cancelled = TRUE WHERE event_id = %s", (str(event_id),))
        conn.commit()
        return JSONResponse(status_code=200, content={"message": "All tickets are refunded, event is cancelled"})

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()


@router.post("/upload_photo")
async def upload_photo(photo: UploadFile = File(...)):
    try:
        os.makedirs("static/events", exist_ok=True)
        filename = f"{uuid4()}{os.path.splitext(photo.filename)[1]}"
        photo_path = os.path.join("app/static", "events", filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        return {"detail": "Photo uploaded successfully", "filename": filename}
    except Exception as e:
        logging.error(f"Failed to upload: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search_events", response_model=List[Event])
async def search_events(name: Optional[str] = Query(None, description="Search by event name")):
    query = """
    SELECT
        e.event_id, e.name, e.date, e.description, e.is_done, e.remaining_seat_no, e.return_expire_date,
        e.organizer_id, o.organizer_name AS organizer_name,
        e.venue_id, v.name AS venue_name, v.city AS venue_city, v.state AS venue_state, v.street AS venue_street, v.status, v.capacity, v.row_count, v.column_count,
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
            "rejected": event[14],
            "capacity": event[15],
            "row_count": event[16],
            "column_count": event[17]
        },
        "category": {
            "category_id": event[18],
            "category_name": event[19]
        },
        "photo": event[20],
        "is_cancelled": event[21],
        "photo_plan": event[22]
    }
    # Fetch restriction asynchronously
    event_dict["restriction"] = await read_restriction(str(event[0]))
    return event_dict

@router.get("/{event_id}/seating_plan")
async def get_seating_plan(event_id: UUID):
    query = """
    SELECT * FROM seating_plan WHERE event_id = %(event_id)s;
    """
    dictCursor.execute(query, {
        'event_id': str(event_id)
    })
    seating_plan = dictCursor.fetchall()
    if not seating_plan:
        raise HTTPException(status_code=404, detail="No seating plan found for this event")
    return seating_plan

@router.get("/{event_id}/seating_plan/{category_name}")
async def get_seating_plan_by_category(event_id: UUID, category_name: str):
    query = """
    SELECT * FROM seating_plan WHERE event_id = %(event_id)s AND category_name = %(category_name)s;
    """
    dictCursor.execute(query, {
        'event_id': str(event_id),
        'category_name': category_name
    })
    seating_plan = dictCursor.fetchall()
    if not seating_plan:
        raise HTTPException(status_code=404, detail="No seating plan found for this category")
    return seating_plan

@router.get("/{event_id}/sold_tickets_by_category")
async def get_number_of_sold_tickets_by_category(event_id: UUID):
    query = """
    SELECT tc.category_name, tc.price, COUNT(t.ticket_id) AS sold_tickets
    FROM Ticket t
    JOIN Seating_Plan sp ON t.ticket_id = sp.ticket_id
    JOIN Ticket_Category tc ON sp.event_id = tc.event_id AND sp.category_name = tc.category_name
    WHERE t.event_id = %s AND t.is_sold = TRUE
    GROUP BY tc.category_name, tc.price
    ORDER BY tc.price ASC
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (str(event_id),))
            result = cursor.fetchall()
            return {"event_id": event_id, "sold_tickets_by_category": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{event_id}/available_tickets_by_category")
async def get_number_of_available_tickets_by_category(event_id: UUID):
    query = """
    SELECT tc.category_name, tc.price, COUNT(t.ticket_id) AS available_tickets
    FROM Ticket t
    JOIN Seating_Plan sp ON t.ticket_id = sp.ticket_id
    JOIN Ticket_Category tc ON sp.event_id = tc.event_id AND sp.category_name = tc.category_name
    WHERE t.event_id = %s AND t.is_sold = FALSE
    GROUP BY tc.category_name, tc.price
    ORDER BY tc.price DESC
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (str(event_id),))
            result = cursor.fetchall()
            return {"event_id": event_id, "available_tickets_by_category": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{event_id}/buyer_age_distribution")
async def get_buyer_age_distribution(event_id: UUID):
    query = """
    SELECT
      CASE
        WHEN age BETWEEN 18 AND 25 THEN '18-25'
        WHEN age BETWEEN 26 AND 40 THEN '26-40'
        WHEN age BETWEEN 41 AND 60 THEN '41-60'
        WHEN age > 60 THEN '60+'
      END AS age_group,
      COUNT(*) AS count
    FROM (
      SELECT
        DATE_PART('year', AGE(tb.birth_date)) AS age
      FROM
        Transaction t
        JOIN Ticket_Buyer tb ON t.buyer_id = tb.user_id
      WHERE
        t.event_id = %s
    ) AS ages
    GROUP BY age_group
    ORDER BY age_group;
    """
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(query, (str(event_id),))
            result = cursor.fetchall()
            return {"event_id": event_id, "buyer_age_distribution": result}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))



