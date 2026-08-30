from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import AuditLog
from app.schemas.schemas import AuditLogOut

router = APIRouter()

@router.get("/ledger", response_model=List[AuditLogOut])
def get_audit_ledger(
    stage: Optional[str] = None,
    limit: int = Query(50, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog)
    if stage:
        query = query.filter(AuditLog.stage == stage)
    
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return logs
