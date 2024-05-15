# from typing import Dict, Any
# from app.database.session import conn
# from psycopg2.extras import RealDictCursor
# from fastapi import FastAPI, status, HTTPException, Depends, APIRouter, Path
# from app.database.session import cursor, conn
# from app.models.user import User, TicketBuyer
# from uuid import UUID
# from typing import Dict, Any, List
# from app.models.ticket import TicketInfo

# router = APIRouter()

# router = APIRouter()
# @router.get("/buyer_profile/{user_id}", response_model=Dict[str, Any])
# async def get_buyer_profile(user_id: UUID):
#     cursor = conn.cursor(cursor_factory=RealDictCursor)
#     try:
#         # Fetch user details
#         cursor.execute("""
#             SELECT u.user_id, u.email, u.phone, u.last_login, u.password, tb.balance, tb.birth_date, tb.current_cart 
#             FROM users u
#             JOIN ticket_buyer tb ON u.user_id = tb.user_id
#             WHERE u.user_id = %s
#         """, (str(user_id),))
#         user_data = cursor.fetchone()
#         if not user_data:
#             raise HTTPException(status_code=404, detail="User not found")

#         # Fetch tickets and event details
#         cursor.execute("""
#             SELECT t.ticket_id, e.event_id, t.seat_number, tc.price, t.category_name,
#                    e.name as event_name, e.date as event_date, e.description as event_description,
#                    e.is_done, e.is_cancelled, eo.organizer_name, v.name as venue_name, v.city as venue_city,
#                    v.state as venue_state, v.street as venue_street
#             FROM ticket t
#             JOIN ticket_list tl ON t.ticket_id = tl.ticket_id
#             JOIN event e ON t.event_id = e.event_id
#             JOIN event_organizer eo ON e.organizer_id = eo.user_id
#             JOIN venue v ON e.venue_id = v.venue_id
#             JOIN ticket_category tc ON t.event_id = tc.event_id AND t.category_name = tc.category_name
#             WHERE tl.user_id = %s
#         """, (str(user_id),))
#         tickets_data = cursor.fetchall()

#         tickets = []
#         for ticket in tickets_data:
#             tickets.append(TicketInfo(
#                 ticket_id=ticket['ticket_id'],
#                 event_id=ticket['event_id'],
#                 seat_number=ticket['seat_number'],
#                 price=ticket['price'],
#                 category_name=ticket['category_name']))

#         # Create TicketBuyer instance with all required fields
#         uuser = TicketBuyer(
#             user_id=user_data['user_id'],
#             password=user_data['password'],
#             email=user_data['email'],
#             phone=user_data['phone'],
#             last_login=user_data['last_login'],
#             balance=user_data['balance'],
#             birth_date=user_data['birth_date'],
#             name="",  # Assuming name and surname are not present in the database
#             surname="",
#             current_cart=user_data['current_cart'],
#             ticket_list=tickets  # Placeholder for ticket list
#         )
#         profile_data = {
#             "ticket_buyer": uuser.model_dump(),

#         }

#         return profile_data
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
#     finally:
#         cursor.close()



from typing import Dict, Any
from app.database.session import conn
from psycopg2.extras import RealDictCursor
from fastapi import APIRouter, HTTPException
from app.models.user import User, TicketBuyer
from app.models.ticket import TicketInfo
from app.models.event import Event
from uuid import UUID

router = APIRouter()

@router.get("/buyer_profile/{user_id}", response_model=Dict[str, Any])
async def get_buyer_profile(user_id: UUID):
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # tb.name, tb.surname ekle!
        cursor.execute("""
            SELECT u.user_id, u.email, u.phone, u.last_login, u.password, tb.balance, tb.birth_date, tb.current_cart 
            FROM users u
            JOIN ticket_buyer tb ON u.user_id = tb.user_id
            WHERE u.user_id = %s
        """, (str(user_id),))
        user_data = cursor.fetchone()
    
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        # SEAT NUMBER?
        cursor.execute("""
            SELECT 
                t.ticket_id, 
                tc.price, 
                ev.name as cat_name,
                e.event_id, 
                e.name as event_name, 
                e.date as event_date, 
                e.description as event_description,
                e.is_done, 
                e.is_cancelled, 
                eo.organizer_name,
                v.name as venue_name,
                v.city as venue_city,
                v.state as venue_state,
                v.street as venue_street,
                res.alcohol, res.smoke, res.age, res.max_ticket
            FROM ticket_list tl
            JOIN ticket t ON tl.ticket_id = t.ticket_id
            JOIN event e ON t.event_id = e.event_id
            JOIN event_category ev ON ev.category_id = e.category_id           
            JOIN event_organizer eo ON e.organizer_id = eo.user_id
            JOIN venue v ON e.venue_id = v.venue_id
            JOIN ticket_category tc ON t.event_id = tc.event_id
            JOIN restricted r ON r.event_id = e.event_id
            JOIN restriction res ON res.restriction_id = r.restriction_id           
            WHERE tl.user_id = %s
        """, (str(user_id),))
        tickets_data = cursor.fetchall()
        
        tickets = []
        for ticket in tickets_data:
            ticket_info = {
                "ticket_id": ticket['ticket_id'],
                "event_id": ticket['event_id'],
                "seat_number": "5",
                "price": ticket['price'],
                "category_name": ticket['cat_name']
            }
            event_info = {
                "event_name": ticket["event_name"],
                "event_date": ticket["event_date"],
                "event_description": ticket["event_description"],
                "is_done": ticket["is_done"],
                "is_cancelled": ticket["is_cancelled"],
                "organizer_name": ticket["organizer_name"],
                "venue": {
                    "name": ticket["venue_name"],
                    "city": ticket["venue_city"],
                    "state": ticket["venue_state"],
                    "street": ticket["venue_street"]
                },
                "restrictions": {
                    "alcohol": ticket["alcohol"],
                    "smoke": ticket["smoke"],
                    "age": ticket["age"],
                    "max_ticket": ticket["max_ticket"]
                }
            }
            tickets.append({"ticket_info": ticket_info, "event_info": event_info})

        # Create TicketBuyer instance with all required fields
        uuser = TicketBuyer(
            user_id=user_data['user_id'],
            password="",
            email=user_data['email'],
            phone=user_data['phone'],
            last_login=user_data['last_login'],
            balance=user_data['balance'],
            birth_date=user_data['birth_date'],
            name="name",  # Assuming name and surname are not present in the database
            surname="surname",
            current_cart=user_data['current_cart'],
            ticket_list=[]  # Include ticket details
        )
        profile_data = {
            "user": uuser.model_dump(),
            "tickets": tickets
        }

        return profile_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
