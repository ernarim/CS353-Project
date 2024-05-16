from fastapi import APIRouter
from fastapi import HTTPException, status
from app.models.seating_plan import ReserverSeating, UnreserveSeating
from app.database.session import cursor, conn

router = APIRouter()

@router.post("/reserve")
async def reserve_seat(reserved_seat:ReserverSeating):
    # Is_Available, Is_Reserved, Is_LR_Equal
    seating_plan_query = '''
        WITH status AS (
            SELECT
                CASE
                    WHEN is_available = FALSE THEN (FALSE, TRUE, TRUE)
                    WHEN is_reserved = FALSE THEN (TRUE, FALSE, FALSE)
                    WHEN last_reserver IS NULL OR last_reserver <> %(user_id)s THEN (TRUE, TRUE, FALSE)
                    ELSE (TRUE, TRUE, TRUE)
                END AS reservation_status
            FROM seating_plan
            WHERE event_id = %(event_id)s
                AND row_number = %(row)s
                AND column_number = %(col)s
        )
        UPDATE seating_plan
        SET is_reserved = CASE
                            WHEN (SELECT * FROM status) = (TRUE, FALSE, FALSE) THEN TRUE
                            WHEN (SELECT * FROM status) = (TRUE, TRUE, TRUE) THEN FALSE
                            ELSE is_reserved
                        END,
            last_reserver = CASE
                            WHEN (SELECT * FROM status) = (TRUE, FALSE, FALSE) THEN %(user_id)s
                            WHEN (SELECT * FROM status) = (TRUE, TRUE, TRUE) THEN NULL
                            ELSE last_reserver
                        END
        WHERE event_id = %(event_id)s
            AND row_number = %(row)s
            AND column_number = %(col)s
        RETURNING (SELECT * FROM status)
    '''
    try:
        cursor.execute(
            seating_plan_query,
            {
                'event_id': str(reserved_seat.event_id),
                'row': reserved_seat.row_number,
                'col': reserved_seat.column_number,
                'user_id': str(reserved_seat.user_id)
            }
        )
        reservation_status = cursor.fetchone()[0]
        reservation_status = reservation_status[1:len(reservation_status)-1].split(',')
        reservation_status = [True if status == 't' else False for status in reservation_status]

        if reservation_status is None:
            conn.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status error."
            )
        conn.commit()

        if reservation_status[0]:
            if reservation_status[1]:
                if reservation_status[2]:
                    return {"status": "unreserved"}
                else:
                    return {"status": "occupied"}
            else:
                return {"status": "reserved"}
        else:
            return {"status": "sold"}

    except Exception as e:
        conn.rollback()
        raise Exception(str(e))

@router.post("/unreserve")
async def unreserve_seat(reserved_seat:UnreserveSeating):
    seating_plan_query = '''
        UPDATE seating_plan
        SET is_reserved = FALSE,
            last_reserver = NULL
        WHERE event_id = %(event_id)s
            AND last_reserver = %(user_id)s
            AND category_name = %(category_name)s
    '''
    try:
        cursor.execute(
            seating_plan_query,
            {
                'event_id': str(reserved_seat.event_id),
                'user_id': str(reserved_seat.user_id),
                'category_name': reserved_seat.category_name
            }
        )
        conn.commit()
        return {"status": "unreserved"}
    except Exception as e:
        conn.rollback()
        raise Exception(str(e))
