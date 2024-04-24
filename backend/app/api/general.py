from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.item import Item
router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Hello World"}

@router.post("/items/")
async def create_item(item: Item):
    cursor.execute(
        "INSERT INTO item (name, description, price, tax) VALUES (%s, %s, %s, %s) RETURNING id",
        (item.name, item.description, item.price, item.tax)
    )
    item_id = cursor.fetchone()[0]
    conn.commit()
    return {"id": item_id}

@router.get("/items")
async def get_items():
    cursor.execute("SELECT * FROM item")
    items = cursor.fetchall()
    return items