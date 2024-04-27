from fastapi import APIRouter
from app.database.session import cursor, conn
from app.models.report import ReportCreate, Report
from fastapi import HTTPException
from uuid import uuid4, UUID
router = APIRouter()

@router.post("", response_model=Report, status_code=201)
async def create_report(report: ReportCreate):
    report_id = uuid4()
    query = """
    INSERT INTO Report (report_id, admin_id, name, description)
    VALUES (%s, %s, %s, %s)
    RETURNING *;
    """
    try:
        cursor.execute(query, (str(report_id), str(report.admin_id), report.name, report.description))
        new_report = cursor.fetchone()
        conn.commit()
        return Report(**new_report)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/reports/{report_id}", response_model=Report)
async def read_report(report_id: UUID):
    query = "SELECT * FROM Report WHERE report_id = %s;"
    cursor.execute(query, (str(report_id),))
    report = cursor.fetchone()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return Report(**report)

@router.get("", response_model=list[Report])
async def read_all_reports():
    cursor.execute("SELECT * FROM Report;")
    reports = cursor.fetchall()
    return [Report(**report) for report in reports]

@router.patch("/{report_id}", response_model=Report)
async def update_report(report_id: UUID, report: Report):
    query = """
    UPDATE Report
    SET name = %s, description = %s, admin_id = %s
    WHERE report_id = %s
    RETURNING *;
    """
    cursor.execute(query, (report.name, report.description, str(report.admin_id), str(report_id)))
    updated_report = cursor.fetchone()
    if not updated_report:
        raise HTTPException(status_code=404, detail="Report not found")
    conn.commit()
    return Report(**updated_report)

@router.delete("/{report_id}", status_code=204)
async def delete_report(report_id: UUID):
    query = "DELETE FROM Report WHERE report_id = %s RETURNING *;"
    cursor.execute(query, (str(report_id),))
    deleted_report = cursor.fetchone()
    if not deleted_report:
        raise HTTPException(status_code=404, detail="Report not found")
    conn.commit()
    return {"detail": "Report successfully deleted"}