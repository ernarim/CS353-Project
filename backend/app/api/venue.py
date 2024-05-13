from fastapi import APIRouter
from app.database.session import cursor, conn, dictCursor
from app.models.venue import Venue, VenueCreate
from app.models.seats import Seats
from fastapi import HTTPException
from uuid import UUID, uuid4
from typing import List
from psycopg2.errors import ForeignKeyViolation

router = APIRouter()


@router.get("", response_model=List[Venue])
async def get_all_venues():
    try:
        dictCursor.execute("SELECT * FROM Venue;")
        venue_records = dictCursor.fetchall()
        print(type(venue_records))
        print(venue_records)
        venues = [Venue(**{
            'venue_id': record['venue_id'],
            'name': record['name'],
            'city': record['city'],
            'state': record['state'],
            'street': record['street'],
            'status': record['status'],
            'capacity': record['capacity'],
            'row_count': record['row_count'],
            'column_count': record['column_count'],
            'requester_id': record['requester_id']
        }) for record in venue_records]
        print(venues)
        return venues
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{venue_id}", response_model=Venue)
async def read_venue(venue_id: UUID):
    cursor.execute("SELECT * FROM Venue WHERE venue_id = %s", (str(venue_id),))
    venue = dictCursor.fetchone()

    venue_data = {
        "venue_id": venue['venue_id'],
        "name": venue['name'],
        "city": venue['city'],
        "state": venue['state'],
        "street": venue['street'],
        "capacity": venue['capacity'],
        "row_count": venue['row_count'],
        "column_count": venue['column_count'],
        "status": venue['status'],
        "requester_id": venue['requester_id'],
    }
    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    if venue_data['row_count'] > 0:
        print("Getting seats")
        cursor.execute("SELECT row_number, column_number FROM Seats WHERE venue_id = %s", (str(venue_id),))
        seats = cursor.fetchall()
        venue_data['seats'] = seats
    else:
        venue_data['seats'] = []
    return venue_data


@router.post("", response_model=Venue, status_code=201)
async def create_venue(venue: VenueCreate):
    venue_id = uuid4()
    venue_query = """
    INSERT INTO Venue (venue_id, requester_id, name, city, state, street, capacity, row_count, column_count, status)
    VALUES (%(venue_id)s, %(requester_id)s, %(name)s, %(city)s, %(state)s, %(street)s, %(capacity)s, %(row_count)s, %(column_count)s, 'pending')
    RETURNING *;
    """
    seats_query = """
    INSERT INTO Seats (venue_id, row_number, column_number)
    VALUES (%(venue_id)s, %(row_number)s, %(column_number)s);
    """
    try:
        print(venue)
        dictCursor.execute(venue_query, {
            'venue_id': str(venue_id),
            'requester_id' : str(venue.requester_id),
            'name': venue.name,
            'city': venue.city,
            'state': venue.state,
            'street': venue.street,
            'capacity': venue.capacity,
            'row_count': venue.row_count,
            'column_count': venue.column_count
        })
        new_venue = dictCursor.fetchone()
        print(dictCursor.fetchone())
        print(new_venue)
        if new_venue is None:
            conn.rollback()
            raise HTTPException(status_code=400, detail="Failed to create venue")

        if (venue.row_count == 0) != (venue.column_count == 0):
            conn.rollback()
            raise HTTPException(status_code=400, detail="Both row_count and column_count must be provided")
        else:
            if venue.row_count != 0 and venue.row_count * venue.column_count < venue.capacity:
                conn.rollback()
                raise HTTPException(status_code=400, detail="Invalid capacity or seat count")

        if venue.capacity <= 0:
            conn.rollback()
            raise HTTPException(status_code=400, detail="Invalid capacity or seat count")

        if venue.row_count > 0:
            for seat in venue.seats:
                cursor.execute(seats_query, {
                    'venue_id': str(venue_id),
                    'row_number': seat[0],
                    'column_number': seat[1]
                })

        conn.commit()
        return {
            "venue_id": new_venue['venue_id'],
            "name": new_venue['name'],
            "city": new_venue['city'],
            "state": new_venue['state'],
            "street": new_venue['street'],
            "capacity": new_venue['capacity'],
            "row_count": new_venue['row_count'],
            "column_count": new_venue['column_count'],
            "status": new_venue['status'],
            "requester_id": new_venue['requester_id'],
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{venue_id}", response_model=Venue)
async def update_venue(venue_id: UUID, venue: Venue):
    update_venue_query = """
    UPDATE Venue
    SET name = %s, city = %s, state = %s, street = %s, status = %s,
        capacity = %s, row_count = %s, column_count = %s
    WHERE venue_id = %s RETURNING *;
    """
    try:
        cursor.execute(update_venue_query, (
            venue.name, venue.city, venue.state, venue.street,
            venue.status, venue.capacity, venue.row_count, venue.column_count, str(venue_id)
        ))
        updated_venue = cursor.fetchone()

        if updated_venue is None:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Venue not found")

        manage_seats(venue_id, venue.row_count, venue.column_count)

        conn.commit()

        return Venue.parse_obj({
            "venue_id": updated_venue[0],
            "name": updated_venue[1],
            "city": updated_venue[2],
            "state": updated_venue[3],
            "street": updated_venue[4],
            "status": updated_venue[5],
            "capacity": updated_venue[6],
            "row_count": updated_venue[7],
            "column_count": updated_venue[8]
        })
    except HTTPException as http_exc:
        conn.rollback()
        raise http_exc
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

def manage_seats(venue_id: UUID, row_count: int, column_count: int):

    delete_seats_query = """
    DELETE FROM Seats
    WHERE venue_id = %s AND (row_number > %s OR column_number > %s);
    """
    cursor.execute(delete_seats_query, (str(venue_id), row_count, column_count))

    for row in range(1, row_count + 1):
        for column in range(1, column_count + 1):
            insert_seat_query = """
            INSERT INTO Seats (venue_id, row_number, column_number)
            VALUES (%s, %s, %s) ON CONFLICT DO NOTHING;
            """
            cursor.execute(insert_seat_query, (str(venue_id), row, column))


@router.delete("/{venue_id}", status_code=204)
async def delete_venue(venue_id: UUID):
    try:

        cursor.execute("DELETE FROM Seats WHERE venue_id = %s;", (str(venue_id),))
        cursor.execute("DELETE FROM Venue WHERE venue_id = %s RETURNING *;", (str(venue_id),))
        deleted_venue = cursor.fetchone()

        if not deleted_venue:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Venue not found")

        conn.commit()
        return {"detail": "Venue deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete venue: {e}")


@router.get("/{venue_id}/seats", response_model=List[Seats])
async def get_venue_seats(venue_id: UUID):
    query = """
    SELECT row_number, column_number, venue_id
    FROM Seats
    WHERE venue_id = %(venue_id)s;
    """
    try:
        cursor.execute(query, {
            'venue_id': str(venue_id)
        })
        seats = cursor.fetchall()

        if not seats:
            return []
        return [Seats(row_number=seat[0], column_number=seat[1], venue_id=seat[2] ) for seat in seats]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")