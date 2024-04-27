from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.ticket import Ticket
from app.models.cart import Cart
from app.models.gift import Gift
from app.models.transaction import Transaction
from fastapi import HTTPException
from uuid import UUID, uuid4
from datetime import datetime
router = APIRouter()

@router.post("/add_to_cart/{cart_id}")
async def add_ticket_to_cart(ticket_data: Ticket, cart_id: UUID):
    ticket_id = uuid4()  # Generate a new UUID for the ticket

    create_ticket_query = """
    INSERT INTO Ticket (ticket_id, seat_number, is_sold, event_id, category_name)
    VALUES (%s, %s, %s, %s, %s) RETURNING ticket_id;
    """
    add_to_cart_query = """
    INSERT INTO Added (cart_id, ticket_id)
    VALUES (%s, %s);
    """
    try:
        # Create the ticket
        cursor.execute(create_ticket_query, (str(ticket_id), ticket_data.seat_number, False, str(ticket_data.event_id), ticket_data.category_name))
        ticket_id_returned = cursor.fetchone()[0]

        # Add the ticket to the cart
        cursor.execute(add_to_cart_query, (str(cart_id), str(ticket_id_returned)))

        conn.commit()  # Commit the transaction
        return {
            "ticket_id": ticket_id_returned,
            "cart_id": cart_id
        }
    except Exception as e:
        conn.rollback()  # Rollback in case of any error
        raise HTTPException(status_code=500, detail=f"Failed to add ticket to cart: {str(e)}")
    

@router.post("/make_gift/{cart_id}")
async def make_cart_a_gift(cart_id: UUID, gift_data: Gift):
    gift_query = """
    INSERT INTO Gift (gift_id, gift_msg, gift_date, receiver_mail)
    VALUES (%s, %s, %s, %s) RETURNING gift_id;
    """
    gifted_query = """
    INSERT INTO Gifted (gift_id, cart_id)
    VALUES (%s, %s);
    """
    update_cart_query = """
    UPDATE Cart SET is_gift = TRUE WHERE cart_id = %s;
    """
    gift_id = uuid4()
    gift_date = datetime.now()

    try:
        cursor.execute(gift_query, (str(gift_id), gift_data.gift_msg, gift_date, gift_data.receiver_mail))
        
        cursor.execute(gifted_query, (str(gift_id), str(cart_id)))
        
        cursor.execute(update_cart_query, (str(cart_id),))
        
        conn.commit() 
        return {"gift_id": gift_id } 
    except Exception as e:
        conn.rollback()  
        raise HTTPException(status_code=500, detail=f"Failed to process cart as gift: {str(e)}")


@router.post("/transaction")
async def transaction(transaction_data: Transaction):
    print("test")