from typing import List
from fastapi import APIRouter, Depends, Query, Response, status
from app.database.session import cursor, conn
from app.models.ticket import Ticket, TicketList
from app.models.seating_plan import SeatingPlan
from app.models.cart import Cart
from app.models.gift import Gift
from app.models.transaction import TransactionList
from app.utils.deps import get_current_user
from fastapi import HTTPException
from psycopg2.extras import RealDictCursor
from uuid import UUID, uuid4
from datetime import datetime
import asyncpg

router = APIRouter()

@router.post("/add_to_cart/{cart_id}")
async def add_ticket_to_cart(tickets: TicketList, cart_id: UUID):
    tickets = tickets.tickets
    ticket_ids = [str(ticket.ticket_id) for ticket in tickets]


    adding_query = """
        INSERT INTO added (cart_id, ticket_id) VALUES (%(cart_id)s, %(ticket_id)s);
    """

    try:
        if(len(ticket_ids) == 0):
            raise HTTPException(status_code=400, detail="No ticket data provided")

        for i in range(len(ticket_ids)):
            cursor.execute(adding_query, {
                "ticket_id": ticket_ids[i],
                "cart_id": str(cart_id)
            })
        conn.commit()

        return {
            "message": "Ticket added to cart successfully"
        }
    except Exception as e:
        conn.rollback()
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
async def transaction(transaction_data: TransactionList):
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT balance FROM ticket_buyer WHERE user_id = %s", (str(transaction_data.transactions[0].buyer_id),))
        buyer = cursor.fetchone()
        if buyer is None:
            raise HTTPException(status_code=404, detail="Buyer not found")

        total_amount = sum(item.amount for item in transaction_data.transactions)
        if buyer['balance'] < total_amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

        # Deduct balance from buyer
        cursor.execute("UPDATE ticket_buyer SET balance = balance - %s WHERE user_id = %s", (total_amount, str(transaction_data.transactions[0].buyer_id)))

        for item in transaction_data.transactions:
            transaction_id = str(uuid4())
            transaction_date = datetime.now()

            cursor.execute("""
                INSERT INTO transaction (transaction_id, organizer_id, buyer_id, transaction_date, amount, event_id)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (transaction_id, str(item.organizer_id), str(item.buyer_id), transaction_date, item.amount, str(item.event_id)))

            # Update ticket as sold
            cursor.execute("UPDATE ticket SET is_sold = TRUE WHERE ticket_id = %s", (str(item.ticket_id),))

            # Remove ticket from user's cart (Added table)
            cursor.execute("DELETE FROM added WHERE cart_id = (SELECT current_cart FROM ticket_buyer WHERE user_id = %s) AND ticket_id = %s", (str(item.buyer_id), str(item.ticket_id)))

            # Update remaining seats in Event table
            cursor.execute("UPDATE event SET remaining_seat_no = remaining_seat_no - 1 WHERE event_id = %s", (str(item.event_id),))

            cursor.execute("UPDATE seating_plan SET is_available = FALSE WHERE ticket_id = %s", (str(item.ticket_id),))

            if item.email:
                # Get the user ID for the given email
                cursor.execute("SELECT user_id FROM users WHERE email = %s", (item.email,))
                recipient = cursor.fetchone()
                if recipient:
                    recipient_id = recipient['user_id']
                    # Add ticket to recipient's Ticket_List table
                    cursor.execute("INSERT INTO ticket_list (user_id, ticket_id) VALUES (%s, %s)", (str(recipient_id), str(item.ticket_id)))
                else:
                    raise HTTPException(status_code=404, detail="Recipient not found")
            else:
                # Add ticket to buyer's Ticket_List table
                cursor.execute("INSERT INTO ticket_list (user_id, ticket_id) VALUES (%s, %s)", (str(item.buyer_id), str(item.ticket_id)))

            # Update organizer's balance
            cursor.execute("UPDATE event_organizer SET balance = balance + %s WHERE user_id = %s", (item.amount, str(item.organizer_id)))

        conn.commit()
        return {"message": "Transaction completed successfully"}

    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete('/delete_from_cart/{ticket_id}', summary="Remove a ticket from the cart")
async def delete_from_cart(ticket_id: UUID):
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT cart_id FROM added WHERE ticket_id = %s", (str(ticket_id),))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Ticket not found in any cart")

        cart_id = result['cart_id']

        cursor.execute("DELETE FROM added WHERE cart_id = %s AND ticket_id = %s", (str(cart_id), str(ticket_id)))

        cursor.execute("UPDATE seating_plan SET is_reserved = FALSE WHERE ticket_id = %s", (str(ticket_id),))

        conn.commit()
        return {"message": "Ticket removed from cart successfully"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))



