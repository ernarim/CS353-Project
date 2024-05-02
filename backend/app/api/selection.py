from fastapi import APIRouter
from fastapi import HTTPException, status
from app.models.seating_plan import ReserverSeating
from app.database.session import cursor, conn

router = APIRouter()

@router.post("/reserve")
async def reserve_seat(reserved_seat:ReserverSeating):
    seating_plan_query = '''
        WITH current_status AS (
            SELECT
                CASE
                    WHEN is_reserved = TRUE THEN TRUE
                    ELSE FALSE
                END AS reservation_status
            FROM seating_plan
            WHERE event_id = %(event_id)s
                AND row_number = %(row)s
                AND column_number = %(col)s
        )
        UPDATE seating_plan
        SET is_reserved = TRUE
        FROM current_status
        WHERE seating_plan.event_id = %(event_id)s
            AND seating_plan.row_number = %(row)s
            AND seating_plan.column_number = %(col)s
            AND current_status.reservation_status = FALSE
        RETURNING current_status.reservation_status AS result
    '''
    try:
        cursor.execute(
            seating_plan_query,
            {
                'event_id': str(reserved_seat.event_id),
                'row': reserved_seat.row_number,
                'col': reserved_seat.column_number
            }
        )
        reservation_status = cursor.fetchone()
        conn.commit()

        # cursor.execute("SELECT * FROM seating_plan WHERE event_id = %s AND row_number = %s AND column_number = %s", (str(reserved_seat.event_id), reserved_seat.row_number, reserved_seat.column_number))
        # reserved_seat = cursor.fetchone()
        # conn.commit()
        # return {"reservation_status": reserved_seat}

        if reservation_status is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No seat available for reservation."
            )
        else:
            return {
                "event_id": reserved_seat.event_id,
                "row_number": reserved_seat.row_number,
                "column_number": reserved_seat.column_number
            }
    except Exception as e:
        conn.rollback()
        print(e)
        raise Exception(str(e))

