from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.user import User
from fastapi import HTTPException, status
from typing import List
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


