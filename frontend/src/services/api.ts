const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api/v1";

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("skyguard_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "API Request Failed");
    }
    return res.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || "API Request Failed");
    }
    return res.json();
  }

  // Live Weather & Stations
  async getLiveCards() {
    return this.get<any[]>("/weather/live-cards");
  }

  async searchLocations(query: string) {
    return this.get<any[]>(`/weather/search-locations?query=${encodeURIComponent(query)}`);
  }

  async getWeatherByCoordinates(lat: number, lon: number, name?: string) {
    const q = `/weather/coordinates?latitude=${lat}&longitude=${lon}${name ? `&location_name=${encodeURIComponent(name)}` : ""}`;
    return this.get<any>(q);
  }

  async getStations() {
    return this.get<any[]>("/stations/");
  }

  async getStationById(id: number) {
    return this.get<any>(`/stations/${id}`);
  }

  async getStationSeries(id: number, limit = 30) {
    return this.get<any[]>(`/readings/station/${id}/series?limit=${limit}`);
  }

  // Dashboard KPIs
  async getDashboardSummary() {
    return this.get<any>("/dashboard/summary");
  }

  // Anomalies
  async getAnomalies(params?: { severity?: string; status?: string }) {
    let q = "/anomalies/";
    const searchParams = new URLSearchParams();
    if (params?.severity) searchParams.append("severity", params.severity);
    if (params?.status) searchParams.append("status", params.status);
    if (searchParams.toString()) q += `?${searchParams.toString()}`;
    return this.get<any[]>(q);
  }

  async getAnomalyDeepDive(id: number) {
    return this.get<any>(`/anomalies/${id}`);
  }

  async resolveAnomaly(id: number) {
    return this.post<any>(`/anomalies/${id}/resolve`);
  }

  // Sensor Health & Maintenance
  async getHealthMatrix() {
    return this.get<any[]>("/health/matrix");
  }

  async getMaintenanceAlerts() {
    return this.get<any[]>("/alerts/");
  }

  async acknowledgeAlert(id: number) {
    return this.post<any>(`/alerts/${id}/acknowledge`);
  }

  async resolveAlert(id: number) {
    return this.post<any>(`/alerts/${id}/resolve`);
  }

  // Consensus Self-Healing
  async getConsensusOverview() {
    return this.get<any>("/self-healing/consensus-overview");
  }

  async getCorrectedRecords() {
    return this.get<any[]>("/self-healing/records");
  }

  // Explainable AI
  async getAnomalyExplanation(anomalyId: number) {
    return this.get<any>(`/explain/anomaly/${anomalyId}`);
  }

  // Simulation Lab
  async getSimulationScenarios() {
    return this.get<any[]>("/simulation/scenarios");
  }

  async injectSimulation(payload: { station_id: number; scenario_type: string; parameter?: string; magnitude?: number; duration_steps?: number }) {
    return this.post<any>("/simulation/inject", payload);
  }

  // Audit Ledger
  async getAuditLedger(limit = 100) {
    return this.get<any[]>(`/audit/ledger?limit=${limit}`);
  }

  // System Status
  async getSystemStatus() {
    return this.get<any>("/admin/system-status");
  }
}

export const api = new ApiService();
