from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.restriction import Restriction
from fastapi import HTTPException
from uuid import UUID, uuid4
from psycopg2.errors import ForeignKeyViolation
from typing import List, Dict

router = APIRouter()


def rows_to_dicts(cursor, rows):
    columns = [col.name for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

@router.get("", response_model=List[Restriction])
async def get_all_restrictions():
    try:
        cursor.execute("SELECT * FROM Restriction;")
        restrictions = cursor.fetchall()
        return rows_to_dicts(cursor, restrictions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/{restriction_id}", response_model=Restriction)
async def read_restriction(restriction_id: UUID):
    cursor.execute("SELECT * FROM Restriction WHERE restriction_id = %s", (str(restriction_id),))
    restriction = cursor.fetchone()
    restriction = {
        "restriction_id": restriction[0],
        "alcohol": restriction[1],
        "smoke": restriction[2],
        "age": restriction[3],
        "max_ticket": restriction[4]
    }

    if restriction is None:
        raise HTTPException(status_code=404, detail="Restriction not found")
    return restriction

@router.post("/restrictions", response_model=Restriction, status_code=201)
async def create_restriction(restriction: Restriction, event_id: UUID):
    query = """
    INSERT INTO Restriction (restriction_id, alcohol, smoke, age, max_ticket)
    VALUES (%s, %s, %s, %s, %s)
    RETURNING *;
    """
    restricted_query = """
    INSERT INTO Restricted (restriction_id, event_id)
    VALUES (%s, %s);
    """
    try:
        # Insert the new restriction
        cursor.execute(query, (str(restriction.restriction_id), restriction.alcohol,
                               restriction.smoke, restriction.age, restriction.max_ticket))
        new_restriction = cursor.fetchone()
        
        # Check if successfully fetched from the database
        if new_restriction is None:
            conn.rollback()
            raise HTTPException(status_code=404, detail="Failed to create restriction")
        
        # Insert into Restricted table
        cursor.execute(restricted_query, (str(restriction.restriction_id), str(event_id)))
        conn.commit()
        
        # Prepare the response model
        new_restriction_data = {
            "restriction_id": new_restriction[0],
            "alcohol": new_restriction[1],
            "smoke": new_restriction[2],
            "age": new_restriction[3],
            "max_ticket": new_restriction[4]
        }
        return new_restriction_data
    except ForeignKeyViolation as fk_e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Foreign key violation: {fk_e}")
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@router.patch("/{restriction_id}", response_model=Restriction)
async def update_restriction(restriction_id: UUID, restriction: Restriction):
    query = """
    UPDATE Restriction
    SET alcohol = %s, smoke = %s, age = %s, max_ticket = %s
    WHERE restriction_id = %s RETURNING *;
    """
    try:
        cursor.execute(query, (restriction.alcohol, restriction.smoke, restriction.age, restriction.max_ticket, str(restriction_id)))
        updated_restriction = cursor.fetchone()
        conn.commit()
        if updated_restriction is None:
            raise HTTPException(status_code=404, detail="Restriction not found")
        
        updated_restriction = {
            "restriction_id": updated_restriction[0],
            "alcohol": updated_restriction[1],
            "smoke": updated_restriction[2],
            "age": updated_restriction[3],
            "max_ticket": updated_restriction[4]
        }
        return updated_restriction
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/{restriction_id}", status_code=204)
async def delete_restriction_by_restriction_id(restriction_id: UUID):
    try:
        cursor.execute("DELETE FROM Restricted WHERE restriction_id = %s;", (str(restriction_id),))
        
        cursor.execute("DELETE FROM Restriction WHERE restriction_id = %s RETURNING *;", (str(restriction_id),))
        deleted_restriction = cursor.fetchone()
        conn.commit()
        
        if not deleted_restriction:
            raise HTTPException(status_code=404, detail="Restriction not found")
        
        return {"detail": "Restriction deleted successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{event_id}", status_code=204)
async def delete_restriction_by_event_id(event_id: UUID):
    try:
        cursor.execute("SELECT restriction_id FROM Restricted WHERE event_id = %s", (event_id,))
        restriction_id = cursor.fetchone()
        if restriction_id is None:
            return None
        restriction_id = restriction_id[0]
        cursor.execute("DELETE FROM Restricted WHERE event_id = %s", (event_id,))
        cursor.execute("DELETE FROM Restriction WHERE restriction_id = %s RETURNING *;", (restriction_id,))
        deleted_restriction = cursor.fetchone()
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return deleted_restriction
