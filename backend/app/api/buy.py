from typing import List
from fastapi import APIRouter, Depends
from app.database.session import cursor, conn
from app.models.ticket import Ticket, TicketInfo
from app.models.cart import Cart
from app.models.gift import Gift
from app.models.transaction import Transaction
from app.utils.deps import get_current_user
from fastapi import HTTPException
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


async def get_db():
    return await asyncpg.connect(user='your_user', password='your_password', database='your_db', host='127.0.0.1')

@router.post('/transaction')
async def transaction(transaction_data: Transaction, db=Depends(get_db)):
    async with db.transaction():
        buyer = await db.fetchrow("SELECT balance FROM ticket_buyer WHERE user_id = $1", transaction_data.buyer_id)
        if buyer is None:
            raise HTTPException(status_code=404, detail="Buyer not found")
        if buyer['balance'] < transaction_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds")

        # Deduct amount from buyer's balance
        await db.execute("UPDATE ticket_buyer SET balance = balance - $1 WHERE user_id = $2", transaction_data.amount, transaction_data.buyer_id)

        # Add amount to organizer's balance
        await db.execute("UPDATE event_organizer SET balance = balance + $1 WHERE user_id = $2", transaction_data.amount, transaction_data.organizer_id)

        # Record the transaction
        await db.execute("""
            INSERT INTO transaction (transaction_id, organizer_id, buyer_id, transaction_date, amount)
            VALUES ($1, $2, $3, $4, $5)
        """, transaction_data.transaction_id, transaction_data.organizer_id, transaction_data.buyer_id, transaction_data.transaction_date, transaction_data.amount)

        return {"message": "Transaction completed successfully"}
    

@router.get("/get_tickets", response_model=List[TicketInfo])
async def get_tickets(user_id: UUID, db=Depends(get_db)):
    try:
        async with db.transaction():
            user_id = get_current_user()
            tickets = await db.fetch("""
                SELECT t.ticket_id, t.event_id, t.seat_number, tc.price, tc.category_name
                FROM Ticket AS t
                INNER JOIN Ticket_Category AS tc ON t.event_id = tc.event_id AND t.category_name = tc.category_name
                INNER JOIN Ticket_List AS tl ON t.ticket_id = tl.ticket_id
                WHERE tl.user_id = $1
            """, user_id)
            if not tickets:
                raise HTTPException(status_code=404, detail="No tickets found for this user.")
            return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))