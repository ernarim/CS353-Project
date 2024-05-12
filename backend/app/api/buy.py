from typing import List
from fastapi import APIRouter, Depends, Query, Response, status
from app.database.session import cursor, conn
from app.models.ticket import Ticket, TicketInfo
from app.models.cart import Cart
from app.models.gift import Gift
from app.models.transaction import Transaction
from app.utils.deps import get_current_user
from fastapi import HTTPException
from psycopg2.extras import RealDictCursor
from uuid import UUID, uuid4
from datetime import datetime
import asyncpg

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


@router.post('/transaction')
async def transaction(transaction_data: Transaction):
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT balance FROM ticket_buyer WHERE user_id = %s", (transaction_data.buyer_id,))
        buyer = cursor.fetchone()
        if buyer is None:
            raise HTTPException(status_code=404, detail="Buyer not found")
        if buyer['balance'] < transaction_data.amount:
            return Response(status_code=status.HTTP_400_BAD_REQUEST, content="Insufficient balance");

        cursor.execute("UPDATE ticket_buyer SET balance = balance - %s WHERE user_id = %s", (transaction_data.amount, transaction_data.buyer_id))
        cursor.execute("UPDATE event_organizer SET balance = balance + %s WHERE user_id = %s", (transaction_data.amount, transaction_data.organizer_id))
        transaction_id = str(uuid4())
        transaction_date = datetime.now()
        cursor.execute("""
            INSERT INTO transaction (transaction_id, organizer_id, buyer_id, transaction_date, amount)
            VALUES (%s, %s, %s, %s, %s)
        """, (transaction_id, transaction_data.organizer_id, transaction_data.buyer_id, transaction_date, transaction_data.amount))
        conn.commit()

        return {"message": "Transaction completed successfully"}
    except Exception as e:
        conn.rollback() 
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/get_tickets", response_model=List[TicketInfo])
async def get_tickets(user_id: str = Query(...)):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cursor.execute("""
            SELECT t.ticket_id, tc.event_id, t.seat_number, tc.category_name, tc.price
            FROM Ticket AS t JOIN Added ON t.ticket_id = Added.ticket_id 
            JOIN Cart ON Added.cart_id = Cart.cart_id JOIN Ticket_Buyer AS tb ON Cart.cart_id = tb.current_cart
            JOIN Ticket_Category AS tc ON t.event_id = tc.event_id AND t.category_name = tc.category_name
            WHERE tb.user_id = %s
                       """, (user_id,))
        tickets = cursor.fetchall()
        if not tickets:
            return Response(status_code=status.HTTP_204_NO_CONTENT)
        return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))