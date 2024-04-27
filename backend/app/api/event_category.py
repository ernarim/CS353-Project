from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.event_category import EventCategory
from fastapi import HTTPException
from uuid import UUID, uuid4
from psycopg2.errors import ForeignKeyViolation
from typing import List, Dict

router = APIRouter()

def rows_to_dicts(cursor, rows):
    columns = [col.name for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]

@router.get("", response_model=List[Dict[str, str]])
async def get_all_event_categories():
    try:
        cursor.execute("SELECT * FROM public.Event_Category;")
        categories = cursor.fetchall()
        return rows_to_dicts(cursor, categories)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{category_id}", response_model=EventCategory)
async def read_event_category(category_id: UUID):
    cursor.execute("SELECT * FROM public.Event_Category WHERE category_id = %s", (str(category_id),))
    category = cursor.fetchone()
    
    if category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_dict = {
        "category_id": category[0],
        "name": category[1]
    }

    return category_dict

@router.post("", response_model=EventCategory, status_code=201)
async def create_event_category(category: EventCategory):
    query = """
    INSERT INTO public.Event_Category (category_id, name)
    VALUES (%s, %s) RETURNING *;
    """
    try:
        cursor.execute(query, (str(category.category_id), category.name))
        new_category = cursor.fetchone()
        conn.commit()
        new_category = {
            "category_id": new_category[0],
            "name": new_category[1]
        }
        return new_category
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{category_id}", response_model=EventCategory)
async def update_event_category(category_id: UUID, category: EventCategory):
    query = """
    UPDATE public.Event_Category
    SET name = %s
    WHERE category_id = %s RETURNING *;
    """
    try:
        cursor.execute(query, (category.name, str(category_id)))
        updated_category = cursor.fetchone()
        conn.commit()
        if updated_category is None:
            raise HTTPException(status_code=404, detail="Category not found")
        updated_category = {
            "category_id": updated_category[0],
            "name": updated_category[1]
        }
        return updated_category
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    

@router.delete("/{category_id}", status_code=204)
async def delete_event_category(category_id: UUID):
    cursor.execute("DELETE FROM public.Event_Category WHERE category_id = %s RETURNING *;", (str(category_id),))
    deleted_category = cursor.fetchone()
    conn.commit()
    if not deleted_category:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted successfully"}
