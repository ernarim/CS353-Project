from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.user import User
from fastapi import HTTPException, status
from typing import List
from fastapi import Path
from uuid import UUID, uuid4
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