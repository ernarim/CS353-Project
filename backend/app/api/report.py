from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.report import ReportCreate, Report
from fastapi import HTTPException
from uuid import uuid4, UUID
import json
router = APIRouter()

@router.post("", status_code=201)
async def create_report(report: ReportCreate):
    report_id = uuid4()
    query = """
    INSERT INTO Report (
        report_id, date, organizer_id, 
        organizer_statistics, participant_statistics, age_statistics, revenue_statistics
    )
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    RETURNING *;
    """
    try:
        cursor.execute(query, (
            str(report_id), report.date, str(report.organizer_id),
            json.dumps(report.organizer_statistics), json.dumps(report.participant_statistics),
            json.dumps(report.age_statistics), json.dumps(report.revenue_statistics)
        ))
        new_report = cursor.fetchone()
        conn.commit()
        return new_report
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{report_id}")
async def read_report(report_id: UUID):
    query = "SELECT * FROM Report WHERE report_id = %s;"
    cursor.execute(query, (str(report_id),))
    report = cursor.fetchone()
    read_report = {
        "report_id": report[0],
        "date": report[1],
        "organizer_id": report[2],
        "organizer_statistics": report[3],
        "participant_statistics": report[4],
        "age_statistics": report[5],
        "revenue_statistics": report[6]

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
            "organizer_statistics": report[3],
            "participant_statistics": report[4],
            "age_statistics": report[5],
            "revenue_statistics": report[6]

        })

    return read_reports



@router.delete("/{report_id}", status_code=204)
async def delete_report(report_id: UUID):
    query = "DELETE FROM Report WHERE report_id = %s RETURNING *;"
    cursor.execute(query, (str(report_id),))
    deleted_report = cursor.fetchone()
    if not deleted_report:
        raise HTTPException(status_code=404, detail="Report not found")
    conn.commit()
    return {"detail": "Report successfully deleted"}