from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
from uuid import UUID, uuid4
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from app.models.user import User, TicketBuyer, EventOrganizer
from app.utils.deps import get_current_user
from app.database.session import cursor, conn
from app.utils.utils import (
    get_hashed_password,
    create_access_token,
    create_refresh_token,
    verify_password
)


router = APIRouter()
@router.post('/login', summary="Create access and refresh tokens for user")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.username,))
    user = cursor.fetchone()
    conn.commit()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    print(user)
    hashed_pass = user[1]
    if not verify_password(form_data.password, hashed_pass):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    return {
        "access_token": create_access_token(user[2]),
        "refresh_token": create_refresh_token(user[2]),
    }


@router.post('/register', summary="Create new user")
async def create_user(user: User):
    email = user.email
    password = get_hashed_password(user.password)
    user_id = str(uuid4())
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        cursor.execute("INSERT INTO users (user_id, email, password) VALUES (%s, %s, %s)", (user_id, email, password))
        conn.commit()
        return {"user_id": user_id, "email": email}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    
@router.post('/register/ticketbuyer', summary="Register a new ticket buyer")
async def register_ticket_buyer(buyer: TicketBuyer):
    email = buyer.email
    hashed_password = get_hashed_password(buyer.password)
    user_id = str(uuid4())  # Ensuring user_id is a string
    current_cart_str = str(buyer.current_cart) if isinstance(buyer.current_cart, UUID) else buyer.current_cart  # Ensuring current_cart is a string if it's a UUID

    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        # Check if the current cart exists in the cart table
        cursor.execute("SELECT * FROM cart WHERE cart_id = %s", (current_cart_str,))
        if not cursor.fetchone():
            # If the cart does not exist, create it
            cursor.execute("INSERT INTO cart (cart_id) VALUES (%s)", (current_cart_str,))

        # Insert into users table
        cursor.execute("INSERT INTO users (user_id, email, password) VALUES (%s, %s, %s)", (user_id, email, hashed_password))
        # Insert into ticket_buyer table
        cursor.execute("INSERT INTO ticket_buyer (user_id, birth_date, balance, current_cart) VALUES (%s, %s, %s, %s)",
                       (user_id, buyer.birth_date, buyer.balance, current_cart_str))

        cursor.execute("INSERT INTO owned (user_id, cart_id) VALUES (%s, %s)", (user_id, current_cart_str))

        conn.commit()
        return {"user_id": user_id, "email": email, "name": buyer.name, "surname": buyer.surname}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post('/register/eventorganizer', summary="Register a new event organizer")
async def register_event_organizer(organizer: EventOrganizer):
    email = organizer.email
    hashed_password = get_hashed_password(organizer.password)
    user_id = str(uuid4())
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        if cursor.fetchone():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        cursor.execute("INSERT INTO users (user_id, email, password) VALUES (%s, %s, %s)", (user_id, email, hashed_password))
        cursor.execute("INSERT INTO event_organizer (user_id, organizer_name) VALUES (%s, %s)", (user_id, organizer.organizer_name))
        conn.commit()
        return {"user_id": user_id, "email": email, "organizer_name": organizer.organizer_name}
    except Exception as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete('/delete/user/{user_id}', summary="Delete a user")
async def delete_user(user_id: UUID = Path(..., description="The UUID of the user to delete")):
    user_id_str = str(user_id)  # Convert UUID to string for database operations

    try:
        # Retrieve and delete any associated carts from the Owned and Cart tables if the user is a ticket buyer
        cursor.execute("SELECT cart_id FROM owned WHERE user_id = %s", (user_id_str,))
        carts = cursor.fetchall()  # Fetch all cart IDs associated with the user

        # Delete entries from the Owned table
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
        conn.rollback()  # Ensure the database is rolled back to the state before the transaction in case of error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get('/me', summary='Get details of currently logged in user')
async def get_me(user: User = Depends(get_current_user)):
    return user


