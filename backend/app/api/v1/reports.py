from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.reports_service import reports_service

router = APIRouter()

@router.get("/anomalies/csv")
def download_anomalies_csv(db: Session = Depends(get_db)):
    csv_content = reports_service.generate_anomalies_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skyguard_anomalies_report.csv"}
    )

@router.get("/trust-scores/csv")
def download_trust_scores_csv(db: Session = Depends(get_db)):
    csv_content = reports_service.generate_trust_scores_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skyguard_weather_trust_report.csv"}
    )

@router.get("/audit-ledger/csv")
def download_audit_ledger_csv(db: Session = Depends(get_db)):
    csv_content = reports_service.generate_audit_ledger_csv(db)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skyguard_audit_ledger.csv"}
    )
