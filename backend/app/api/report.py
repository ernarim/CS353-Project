from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.report import ReportCreate, Report
from fastapi import HTTPException
from uuid import uuid4, UUID
router = APIRouter()

@router.post("", status_code=201)
async def create_report(report: ReportCreate):
    report_id = uuid4()
    query = """
    INSERT INTO Report (
        report_id, date, organizer_id, organizer_name, 
        sold_tickets, unsold_tickets, total_revenue, total_events, balance
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    RETURNING *;
    """
    try:
        cursor.execute(query, (
            str(report_id), report.date, str(report.organizer_id), report.organizer_name,
            report.sold_tickets, report.unsold_tickets, report.total_revenue,
            report.total_events, report.balance
        ))
        new_report = cursor.fetchone()
        conn.commit()
        return new_report
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/reports/{report_id}")
async def read_report(report_id: UUID):
    query = "SELECT * FROM Report WHERE report_id = %s;"
    cursor.execute(query, (str(report_id),))
    report = cursor.fetchone()
    read_report = {
        "report_id": report[0],
        "date": report[1],
        "organizer_id": report[2],
        "organizer_name": report[3],
        "sold_tickets": report[4],
        "unsold_tickets": report[5],
        "total_revenue": report[6],
        "total_events": report[7],
        "balance": report[8]
    }
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return read_report

@router.get("")
async def read_all_reports():
    cursor.execute("SELECT * FROM Report;")
    
    reports = cursor.fetchall()

    read_reports = []
    for report in reports:
        read_reports.append({
            "report_id": report[0],
            "date": report[1],
            "organizer_id": report[2],
            "organizer_name": report[3],
            "sold_tickets": report[4],
            "unsold_tickets": report[5],
            "total_revenue": report[6],
            "total_events": report[7],
            "balance": report[8]
        })

    return read_reports

@router.patch("/{report_id}")
async def update_report(report_id: UUID, report: ReportCreate):
    query = """
    UPDATE Report
    SET date = %s, organizer_id = %s, organizer_name = %s, 
        sold_tickets = %s, unsold_tickets = %s, total_revenue = %s, 
        total_events = %s, balance = %s
    WHERE report_id = %s
    RETURNING *;
    """
    cursor.execute(query, (
        report.date, str(report.organizer_id), report.organizer_name, report.sold_tickets,
        report.unsold_tickets, report.total_revenue, report.total_events, report.balance,
        str(report_id)
    ))
    updated_report = cursor.fetchone()
    if not updated_report:
        raise HTTPException(status_code=404, detail="Report not found")
    conn.commit()
    return updated_report

@router.delete("/{report_id}", status_code=204)
async def delete_report(report_id: UUID):
    query = "DELETE FROM Report WHERE report_id = %s RETURNING *;"
    cursor.execute(query, (str(report_id),))
    deleted_report = cursor.fetchone()
    if not deleted_report:
        raise HTTPException(status_code=404, detail="Report not found")
    conn.commit()
    return {"detail": "Report successfully deleted"}