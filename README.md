# 🛡️ SKYGUARD AI
### *"From Raw Weather Data to Trusted Weather Intelligence"*

**Smart India Hackathon 2026** • **Problem Statement ID: SIH26073**  
**Organization:** Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD)  
**Theme:** Disaster Management • **Category:** Software (Software-Only)

---

## 🌟 Executive Overview

**SkyGuard AI** is a professional meteorological intelligence platform engineered for Automatic Weather Station (AWS) networks. It receives real-time observations of **Temperature (°C)**, **Surface Pressure (hPa)**, and **Relative Humidity (%)**, executing a **13-stage AI/ML intelligence pipeline** to detect anomalies, verify physical coherence, compute credibility scores, safely self-heal corrupted records, and match recurring hardware failure signatures.

### ⭐ 4 Flagship Scientific Innovations (USPs)

1. **⭐ Weather Trust Score Engine (0–100)**: Multi-factor composite index evaluating Data Quality QC (25%), Temporal Stability (20%), Multivariate Coupling (20%), Historical Baseline (15%), Freshness (10%), and Sensor Health (10%).
2. **⭐ Adaptive Evidence Verification Engine**: Multi-observation verification window (`NORMAL` → `SUSPICIOUS` → `UNDER_VERIFICATION` → `CONFIRMED_ANOMALY` or `CONFIRMED_GENUINE_WEATHER_EVENT`) preventing premature false positives during genuine atmospheric squalls/fronts.
3. **⭐ Consensus-Based Self-Healing Engine**: Tri-model agreement (Temporal Lag, Diurnal Climatological Baseline, and Multivariate Regression) safely computes corrected readings **ONLY** when models achieve $\ge 85\%$ consensus.
4. **⭐ Fault Fingerprint Memory Engine**: Normalized 8-dimensional feature vectors matched via **Cosine Similarity** against historical failure signatures (Spike, Calibration Drift, Frozen Sensor, Communication Drop, Condensation Saturation).
5. **🔒 100% Immutable Raw Storage Guarantee**: Raw physical sensor observations are **NEVER overwritten or silently replaced**. Original and corrected estimates are preserved in a cryptographic-style audit ledger.

---

## 🏛️ End-to-End System Architecture

```text
                 LIVE WEATHER DATA (Open-Meteo API / IMD)
                                  │
                                  ▼
                         WEATHER PROVIDER
                                  │
                                  ▼
                           FASTAPI BACKEND
                                  │
                                  ▼
                         DATA QUALITY QC (WMO)
                                  │
                                  ▼
                         FEATURE ENGINEERING
                                  │
                                  ▼
                          HYBRID AI ENGINE
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
               Rule Bounds   Modified Z-MAD  Isolation Forest
                    └─────────────┼─────────────┘
                                  ▼
                           ANOMALY FUSION
                                  │
                                  ▼
                       ADAPTIVE VERIFICATION ⭐
                                  │
                                  ▼
                         WEATHER TRUST SCORE ⭐
                                  │
                                  ▼
                         ROOT CAUSE DIAGNOSIS
                                  │
                                  ▼
                        FAULT FINGERPRINTING ⭐
                                  │
                                  ▼
                        SENSOR HEALTH & RISK
                                  │
                                  ▼
                       CONSENSUS SELF-HEALING ⭐
                           /             \
                   Agreement >= 85%    Diverged (< 85%)
                         │                     │
                    Safe Estimate         Human Review
                         └──────────┬──────────┘
                                    ▼
                          EXPLAINABLE AI (XAI)
                                    │
                                    ▼
                         DATA PROVENANCE LEDGER
                                    │
                                    ▼
                           SQLAlchemy / MySQL
                               /         \
                              ▼           ▼
                          REST API     WebSocket
                              \           /
                               ▼         ▼
                      REACT 19 + VITE + TAILWIND
```

---

## 🚀 Quick Start Guide

### Option 1: Local Zero-Setup (Fastest for SIH Judges)

#### 1. Backend Setup
```powershell
# In project root
python -m pip install -r backend/requirements.txt
python -m pytest -v
uvicorn app.main:app --app-dir backend --reload --port 8000
```
*Backend API docs available at: `http://localhost:8000/docs`*

#### 2. Frontend Setup
```powershell
# In frontend directory
cd frontend
npm install
npm run dev
```
*Open your browser at: `http://localhost:5173`*

---

### Option 2: Docker Compose (Production Environment)
```bash
docker compose up --build
```
*Frontend: `http://localhost:5173` • Backend: `http://localhost:8000` • MySQL: `localhost:3306`*

---

## 🎯 1-Click SIH Judge Demonstration (`/demo`)

Navigate to **`/demo`** on the platform to execute the automated 6-step interactive walkthrough:
1. **Stage 1**: Ingest nominal live stream for Safdarjung AWS (New Delhi).
2. **Stage 2**: Inject simulated transient thermal surge ($31.2^\circ\text{C} \to 75.2^\circ\text{C}$).
3. **Stage 3**: Trigger AI hybrid detection & transition to `UNDER_VERIFICATION`.
4. **Stage 4**: Verify evidentiary progression & diagnose isolated hardware spike.
5. **Stage 5**: Match `FP-TEMP-SPIKE-01` ($94.2\%$ Cosine similarity).
6. **Stage 6**: Execute tri-model consensus self-healing, safe recovery, and audit verification.

---

## 👥 Default RBAC Accounts

| Role | Email | Password | Perspective |
|---|---|---|---|
| **Administrator** | `admin@skyguard.gov.in` | `Admin@123456` | System Health, Station CRUD, Provider Config |
| **AWS Operator** | `operator@imd.gov.in` | `Operator@123456` | Live Telemetry, Alert Triage, Incident Resolve |
| **Meteorologist** | `researcher@moes.gov.in` | `Research@123456` | SHAP XAI, Multi-Variable Explorer, Raw Logs |
| **Public Viewer** | `public@skyguard.ai` | `Public@123456` | Simplified Citizen Dashboard, Trust Badges |

---

## 📊 Complete Page Sitemap

- `/` — **Landing Page**: MoES / IMD hero, real-time live preview, 4 USP innovation cards.
- `/dashboard` — **Executive Dashboard**: Real-time KPIs, 24h trend charts, alert feed.
- `/live` — **Live Monitoring**: Search any global city or coordinates with real-time WebSocket feeds.
- `/map` — **Geospatial AWS Map**: Interactive Leaflet map with color-coded status markers.
- `/stations` & `/stations/:id` — **Station Registry & Telemetry Details**.
- `/anomalies` & `/anomalies/:id` — **Anomaly Center & Verification Deep Dive**.
- `/health` — **Sensor Health Matrix**: Per-sensor degradation velocity and failure risk.
- `/maintenance` — **Predictive Maintenance Center**: Prioritized work orders.
- `/self-healing` — **Consensus Self-Healing Hub**: Tri-model comparison & safe recovery.
- `/explain` — **Explainable AI (XAI)**: SHAP feature importance & progressive disclosure.
- `/explorer` — **Multi-Variable Data Explorer**: Query correlation time-series.
- `/simulation` — **Simulation Lab**: Fault injector presets (Spike, Drift, Frozen, Gap, Squall).
- `/demo` — **Guided SIH Demo**: 1-Click interactive judge walkthrough.
- `/alerts` — **Alerts Center**: Triage and resolve operational incidents.
- `/audit` — **Observation Integrity Ledger**: Provenance audit proving raw data preservation.
- `/reports` — **Reports Center**: Exportable verified CSV reports.
- `/settings` — **System Settings**: Provider configuration & ML threshold tuning.
- `/login` & `/admin` — **Authentication & System Status Console**.

---

## 📜 Scientific Attribution & License

- **Live Meteorological Stream**: Powered by the **Open-Meteo API** (WMO Standard Model).
- **Target Organization**: Ministry of Earth Sciences (MoES) / India Meteorological Department (IMD).
- **Smart India Hackathon 2026**: Problem Statement SIH26073.
