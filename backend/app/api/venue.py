from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.venue import Venue
from fastapi import HTTPException
from uuid import UUID, uuid4
from typing import List
from psycopg2.errors import ForeignKeyViolation

router = APIRouter()


@router.get("", response_model=List[Venue])
async def get_all_venues():
    try:
        cursor.execute("SELECT * FROM Venue;")
        venue_records = cursor.fetchall()
        venues = [Venue(**{
            'venue_id': record[0],
            'name': record[1],
            'city': record[2],
            'state': record[3],
            'street': record[4],
            'is_verified': record[5],
            'capacity': record[6],
            'row_count': record[7],
            'column_count': record[8]
        }) for record in venue_records]
        return venues
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{venue_id}", response_model=Venue)
async def read_venue(venue_id: UUID):
    cursor.execute("SELECT * FROM Venue WHERE venue_id = %s", (str(venue_id),))
    venue = cursor.fetchone()

    venue_data = {
        "venue_id": venue[0],
        "name": venue[1],
        "city": venue[2],
        "state": venue[3],
        "street": venue[4],
        "is_verified": venue[5],
        "capacity": venue[6],
        "row_count": venue[7],
        "column_count": venue[8]
    }

    if venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue_data


@router.post("", response_model=Venue, status_code=201)
async def create_venue(venue: Venue):
    query = """
    INSERT INTO Venue (venue_id, name, city, state, street, is_verified, capacity, row_count, column_count)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING *;
    """
    try:
        cursor.execute(query, (str(venue.venue_id), venue.name, venue.city, venue.state, venue.street, 
                               venue.is_verified, venue.capacity, venue.row_count, venue.column_count))
        new_venue = cursor.fetchone()
        conn.commit()
        venue_data = {
            "venue_id": new_venue[0],
            "name": new_venue[1],
            "city": new_venue[2],
            "state": new_venue[3],
            "street": new_venue[4],
            "is_verified": new_venue[5],
            "capacity": new_venue[6],
            "row_count": new_venue[7],
            "column_count": new_venue[8]
        }
        return venue_data
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/venues/{venue_id}", response_model=Venue)
async def update_venue(venue_id: UUID, venue: Venue):
    query = """
    UPDATE Venue
    SET name = %s, city = %s, state = %s, street = %s, is_verified = %s, 
        capacity = %s, row_count = %s, column_count = %s
    WHERE venue_id = %s RETURNING *;
    """
    try:
        cursor.execute(query, (venue.name, venue.city, venue.state, venue.street, 
                               venue.is_verified, venue.capacity, venue.row_count, venue.column_count, str(venue_id)))
        updated_venue = cursor.fetchone()
        conn.commit()
        updated_venue_data = {
            "venue_id": updated_venue[0],
            "name": updated_venue[1],
            "city": updated_venue[2],
            "state": updated_venue[3],
            "street": updated_venue[4],
            "is_verified": updated_venue[5],
            "capacity": updated_venue[6],
            "row_count": updated_venue[7],
            "column_count": updated_venue[8]
        }

        if updated_venue is None:
            raise HTTPException(status_code=404, detail="Venue not found")
        return updated_venue_data
    except Exception as e :
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/venues/{venue_id}", status_code=204)
async def delete_venue(venue_id: UUID):
    cursor.execute("DELETE FROM Venue WHERE venue_id = %s RETURNING *;", (str(venue_id),))
    deleted_venue = cursor.fetchone()
    conn.commit()
    if not deleted_venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return {"detail": "Venue deleted successfully"}
