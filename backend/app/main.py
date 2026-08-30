import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.init_db import init_database
from app.services.scheduler import weather_scheduler
from app.websocket.manager import ws_manager

from app.api.v1.auth import router as auth_router
from app.api.v1.stations import router as stations_router
from app.api.v1.weather import router as weather_router
from app.api.v1.readings import router as readings_router
from app.api.v1.anomalies import router as anomalies_router
from app.api.v1.health import router as health_router
from app.api.v1.self_healing import router as self_healing_router
from app.api.v1.explain import router as explain_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.audit import router as audit_router
from app.api.v1.reports import router as reports_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin import router as admin_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("skyguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Init database schema & seeds
    logger.info("Initializing SkyGuard AI Database & ML Models...")
    init_database()
    
    # Start background weather ingestion scheduler
    logger.info("Starting background weather ingestion scheduler...")
    weather_scheduler.start()
    
    yield
    
    # Shutdown: Stop scheduler
    logger.info("Shutting down SkyGuard AI background jobs...")
    weather_scheduler.stop()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI/ML-Based Intelligent Anomaly Detection & Trustworthy Weather Intelligence Platform for Automatic Weather Stations (AWS). Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD).",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=f"{api_v1}/auth", tags=["Authentication & RBAC"])
app.include_router(dashboard_router, prefix=f"{api_v1}/dashboard", tags=["Executive Dashboard"])
app.include_router(stations_router, prefix=f"{api_v1}/stations", tags=["Automatic Weather Stations"])
app.include_router(weather_router, prefix=f"{api_v1}/weather", tags=["Live Weather Ingestion"])
app.include_router(readings_router, prefix=f"{api_v1}/readings", tags=["Sensor Observations"])
app.include_router(anomalies_router, prefix=f"{api_v1}/anomalies", tags=["Anomaly Center & Deep Dive"])
app.include_router(health_router, prefix=f"{api_v1}/health", tags=["Sensor Health & Maintenance"])
app.include_router(self_healing_router, prefix=f"{api_v1}/self-healing", tags=["Consensus-Based Self-Healing"])
app.include_router(explain_router, prefix=f"{api_v1}/explain", tags=["Explainable AI (XAI)"])
app.include_router(simulation_router, prefix=f"{api_v1}/simulation", tags=["Simulation Lab"])
app.include_router(alerts_router, prefix=f"{api_v1}/alerts", tags=["Alerts Management"])
app.include_router(audit_router, prefix=f"{api_v1}/audit", tags=["Observation Integrity Ledger"])
app.include_router(reports_router, prefix=f"{api_v1}/reports", tags=["Reports & Data Export"])
app.include_router(admin_router, prefix=f"{api_v1}/admin", tags=["Administration & Settings"])

# Real-time WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Receive client ping/requests
            data = await websocket.receive_text()
            # Send keep-alive acknowledgement
            await websocket.send_json({"type": "PONG", "message": "SkyGuard stream active"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.warning(f"WebSocket connection error: {e}")
        ws_manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkyGuard AI Backend",
        "tagline": "From Raw Weather Data to Trusted Weather Intelligence",
        "moes_imd_sih_id": "SIH26073"
    }
