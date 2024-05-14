from fastapi import APIRouter, Query, Response
from app.database.session import cursor, conn
from app.models.user import User, GetTicketBuyer, GetUserBase, GetEventOrganizer
from fastapi import HTTPException, status
from typing import List
from fastapi import Path
from psycopg2.extras import RealDictCursor
from uuid import UUID, uuid4
from app.models.ticket import TicketInfo

router = APIRouter()


@router.get('/', response_model=List[User], summary="List all users")
async def list_users():
    try:
        cursor.execute("SELECT user_id, email, password, phone, last_login FROM users")
        result_set = cursor.fetchall()
        users = [User(user_id=row[0], email=row[1], password=row[2], phone=row[3], last_login=row[4]) for row in result_set]
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.delete('/{user_id}', summary="Delete a user")
async def delete_user(user_id: UUID = Path(..., description="The UUID of the user to delete")):
    user_id_str = str(user_id)  # Convert UUID to string for database operations

    try:
        # Retrieve and delete any associated carts from the Owned and Cart tables if the user is a ticket buyer
        cursor.execute("SELECT cart_id FROM owned WHERE user_id = %s", (user_id_str,))
        carts = cursor.fetchall()  # Fetch all cart IDs associated with the user


        cursor.execute("SELECT event_id FROM event WHERE organizer_id = %s", (user_id_str,))
        events = cursor.fetchall()

        if events:
            # Option 1: Delete the events
            for event in events:
                cursor.execute("DELETE FROM event WHERE event_id = %s", (event[0],))

        # Delete entries from the Owned table
        for cart in carts:
            cursor.execute("UPDATE ticket_buyer SET current_cart = NULL WHERE current_cart = %s", (cart[0],))

        cursor.execute("DELETE FROM owned WHERE user_id = %s", (user_id_str,))

        # Delete each cart associated with the user
        for cart in carts:
            cursor.execute("DELETE FROM cart WHERE cart_id = %s", (cart[0],))  # cart[0] because fetchall returns a list of tuples


        # Delete user-specific information from child tables
        cursor.execute("DELETE FROM ticket_buyer WHERE user_id = %s", (user_id_str,))
        cursor.execute("DELETE FROM event_organizer WHERE user_id = %s", (user_id_str,))
        
        # Finally, delete the user from the main users table
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id_str,))
        conn.commit()

        return {"detail": "User successfully deleted"}
    except Exception as e:
        conn.rollback()  # Rollback in case of any error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.get('/ticket_buyer/{user_id}', response_model=GetTicketBuyer, summary="Get a ticket buyer")
async def get_ticket_buyer(user_id: UUID):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT tb.user_id, tb.balance, tb.birth_date, tb.current_cart, 
                       u.email, u.password, u.phone, u.last_login
                FROM Ticket_Buyer tb
                JOIN Users u ON tb.user_id = u.user_id
                WHERE tb.user_id = %s
            """, (str(user_id),))
            ticket_buyer = cursor.fetchone()

            if not ticket_buyer:
                raise HTTPException(status_code=404, detail="Ticket buyer not found")

            return {
                "user_id": ticket_buyer["user_id"],
                "balance": ticket_buyer["balance"],
                "birth_date": ticket_buyer["birth_date"],
                "current_cart": ticket_buyer["current_cart"],
                "email": ticket_buyer["email"],
                "password": ticket_buyer["password"],
                "phone": ticket_buyer["phone"],
                "last_login": ticket_buyer["last_login"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get('/organizer/{user_id}', response_model=GetEventOrganizer, summary="Get an organizer")
async def get_organizer(user_id: UUID):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT eo.user_id, eo.organizer_name, eo.balance, 
                       u.email, u.password, u.phone, u.last_login
                FROM Event_Organizer eo
                JOIN Users u ON eo.user_id = u.user_id
                WHERE eo.user_id = %s
            """, (str(user_id),))
            organizer = cursor.fetchone()

            if not organizer:
                raise HTTPException(status_code=404, detail="Organizer not found")

            return {
                "user_id": organizer["user_id"],
                "organizer_name": organizer["organizer_name"],
                "balance": organizer["balance"],
                "email": organizer["email"],
                "password": organizer["password"],
                "phone": organizer["phone"],
                "last_login": organizer["last_login"]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get('/get_tickets/{user_id}', response_model=List[TicketInfo])
async def get_tickets(user_id: UUID):
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT t.ticket_id, e.event_id, e.name, e.date, e.organizer_id, tc.category_name, tc.price, sp.row_number, sp.column_number
                FROM Ticket t
                JOIN Added a ON t.ticket_id = a.ticket_id
                JOIN Cart c ON a.cart_id = c.cart_id
                JOIN Ticket_Buyer tb ON c.cart_id = tb.current_cart
                JOIN Seating_Plan sp ON t.ticket_id = sp.ticket_id
                JOIN Ticket_Category tc ON sp.event_id = tc.event_id AND sp.category_name = tc.category_name
                JOIN Event e ON t.event_id = e.event_id
                WHERE tb.user_id = %s
            """, (str(user_id),))
            tickets = cursor.fetchall()
            if not tickets:
                return []
            
            return tickets
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))