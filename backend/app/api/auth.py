from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
from uuid import UUID, uuid4
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from app.models.user import User, TicketBuyer, EventOrganizer, UserCreate, TicketBuyerCreate, EventOrganizerCreate, UserLogin
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
async def login(form_data: UserLogin = Depends()):
    cursor.execute("SELECT * FROM users WHERE email = %s", (form_data.email,))
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
    
@router.post('/register/ticketbuyer', summary="Register a new ticket buyer")
async def register_ticket_buyer(buyer: TicketBuyerCreate):
    email = buyer.email
    hashed_password = get_hashed_password(buyer.password)
    user_id = str(uuid4())  # Ensuring user_id is a string
    current_cart_str = str(uuid4()) # Ensuring current_cart is a string if it's a UUID

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
async def register_event_organizer(organizer: EventOrganizerCreate):
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

@router.get('/me', summary='Get details of currently logged in user')
async def get_me(user: User = Depends(get_current_user)):
    return user


