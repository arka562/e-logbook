import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import PredictiveMaintenance from "../components/PredictiveMaintenance";

import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
 Tooltip,
  Legend,
} from "chart.js";

import { Line, Pie } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

function Analytics() {
  const [parameters, setParameters] = useState([]);
  const [selectedParam, setSelectedParam] = useState("");

  const [trend, setTrend] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
  const [issues, setIssues] = useState([]);
  const [anomalies, setAnomalies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  useEffect(() => {
    fetchParameters();
    fetchStaticData();
  }, []);

  useEffect(() => {
    if (selectedParam) {
      fetchTrend(selectedParam);
      fetchAnomalies(selectedParam);
    }
  }, [selectedParam]);

  // ================= FETCH PARAMETERS =================
  const fetchParameters = async () => {
    try {
      const res = await api.get("/analytics/parameters");

      const list = res.data?.data || [];

      setParameters(list);

      if (list.length > 0) {
        setSelectedParam(list[0]._id);
      }

    } catch (err) {
      console.error("Error fetching parameters:", err);
      setParameters([]);
    }
  };

  // ================= FETCH TREND =================
  const fetchTrend = async (paramId) => {
    try {
      setLoading(true);

      const res = await api.get(
        `/analytics/trends?parameterId=${paramId}`
      );

      setTrend(res.data?.data || []);

    } catch (err) {
      console.error("Error fetching trend:", err);
      setTrend([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FETCH ANOMALIES =================
  const fetchAnomalies = async (paramId) => {
    try {
      setAnomalyLoading(true);

      const res = await api.get(
        `/ml/anomaly?parameterId=${paramId}`
      );

      setAnomalies(res.data?.data || []);

    } catch (err) {
      console.error("Error fetching anomalies:", err);
      setAnomalies([]);
    } finally {
      setAnomalyLoading(false);
    }
  };

  // ================= FETCH STATIC DATA =================
  const fetchStaticData = async () => {
    try {
      const [effRes, issueRes] = await Promise.all([
        api.get("/analytics/efficiency"),
        api.get("/analytics/issues"),
      ]);

      setEfficiency(effRes.data?.data || []);
      setIssues(issueRes.data?.data || []);

    } catch (err) {
      console.error("Error fetching analytics:", err);
      setEfficiency([]);
      setIssues([]);
    }
  };

  // ================= ABNORMAL VALUES =================
  const abnormal = useMemo(
    () => anomalies.filter((a) => a.anomaly === -1),
    [anomalies]
  );

  const highestAbnormalValue = useMemo(() => {
    if (!abnormal.length) return null;

    return Math.max(
      ...abnormal.map((a) => Number(a.value))
    );
  }, [abnormal]);

  // ================= CHART DATA =================
  const lineData = {
    labels: trend.map((t) =>
      new Date(t.timestamp).toLocaleDateString()
    ),

    datasets: [
      {
        label: "Parameter Trend",
        data: trend.map((t) => t.value),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.15)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: issues.map((i) => i.equipment),

    datasets: [
      {
        data: issues.map((i) => i.count),

        backgroundColor: [
          "#ef4444",
          "#f59e0b",
          "#22c55e",
          "#3b82f6",
          "#8b5cf6",
        ],

        borderWidth: 0,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const selectedParameter = parameters.find(
    (p) => p._id === selectedParam
  );

  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <div style={styles.bottomGlow} />

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>
              AI Analytics Engine
            </div>

            <h1 style={styles.heading}>
              Industrial Analytics Dashboard
            </h1>

            <p style={styles.subText}>
              Monitor trends, efficiency, anomalies,
              predictive maintenance, and operational
              insights in real-time.
            </p>
          </div>

          <div style={styles.statusCard}>
            <span style={styles.statusDot}></span>
            Analytics Engine Active
          </div>
        </div>

        {/* SELECT PARAMETER */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Parameter Selection
              </h2>

              <p style={styles.cardSubtitle}>
                Choose industrial parameter for analysis
              </p>
            </div>
          </div>

          <select
            value={selectedParam}
            onChange={(e) =>
              setSelectedParam(e.target.value)
            }
            style={styles.input}
          >
            {parameters.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.unit || "unit"})
              </option>
            ))}
          </select>
        </div>

        {/* ALERT CARD */}
        <div
          style={{
            ...styles.alertCard,

            background: abnormal.length
              ? "linear-gradient(135deg,#fee2e2,#fecaca)"
              : "linear-gradient(135deg,#dcfce7,#bbf7d0)",

            border: abnormal.length
              ? "1px solid #fca5a5"
              : "1px solid #86efac",
          }}
        >
          {abnormal.length > 0 ? (
            <div>
              <h3 style={styles.alertTitle}>
                ⚠️ Anomalies Detected
              </h3>

              <p style={styles.alertText}>
                {abnormal.length} abnormal readings found
              </p>

              <p style={styles.alertValue}>
                Highest abnormal value:
                {" "}
                {highestAbnormalValue ?? "-"}
                {" "}
                {selectedParameter?.unit || ""}
              </p>
            </div>
          ) : anomalyLoading ? (
            <h3 style={styles.alertTitle}>
              Checking anomalies...
            </h3>
          ) : (
            <div>
              <h3 style={styles.alertTitle}>
                ✅ System Stable
              </h3>

              <p style={styles.alertText}>
                No anomalies detected
              </p>
            </div>
          )}
        </div>

        {/* CHART GRID */}
        <div style={styles.grid}>
          {/* TREND */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Parameter Trend
                </h2>

                <p style={styles.cardSubtitle}>
                  Historical trend analysis
                </p>
              </div>
            </div>

            {loading ? (
              <p>Loading trend...</p>
            ) : (
              <div style={styles.chartWrapper}>
                <Line data={lineData} />
              </div>
            )}
          </div>

          {/* PIE */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Issue Distribution
                </h2>

                <p style={styles.cardSubtitle}>
                  Equipment issue breakdown
                </p>
              </div>
            </div>

            <div style={styles.pieWrapper}>
              <Pie
                data={pieData}
                options={pieOptions}
              />
            </div>
          </div>
        </div>

        {/* EFFICIENCY */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Efficiency Analysis
              </h2>

              <p style={styles.cardSubtitle}>
                Actual vs design efficiency monitoring
              </p>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Actual</th>
                  <th>Design</th>
                  <th>Efficiency</th>
                </tr>
              </thead>

              <tbody>
                {efficiency.length ? (
                  efficiency.map((e, i) => (
                    <tr key={i}>
                      <td style={styles.boldText}>
                        {e.parameterName}
                      </td>

                      <td>{e.actual}</td>

                      <td>{e.design}</td>

                      <td>
                        <span
                          style={{
                            ...styles.efficiencyBadge,

                            background:
                              e.efficiency >= 90
                                ? "#dcfce7"
                                : "#fee2e2",

                            color:
                              e.efficiency >= 90
                                ? "#166534"
                                : "#b91c1c",
                          }}
                        >
                          {e.efficiency}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANOMALY TABLE */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                AI Anomaly Detection
              </h2>

              <p style={styles.cardSubtitle}>
                Isolation Forest prediction results
              </p>
            </div>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {anomalies.length ? (
                  anomalies.map((a, i) => (
                    <tr
                      key={i}
                      style={{
                        background:
                          a.anomaly === -1
                            ? "#fef2f2"
                            : "white",
                      }}
                    >
                      <td>{a.value}</td>

                      <td>
                        {a.anomaly === -1 ? (
                          <span style={styles.dangerBadge}>
                            ⚠️ Abnormal
                          </span>
                        ) : (
                          <span style={styles.normalBadge}>
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2">
                      No anomaly data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PREDICTIVE MAINTENANCE */}
        <PredictiveMaintenance />
      </div>
    </div>
  );
}

// ================= STYLES =================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#f8fafc 0%,#eef2ff 50%,#e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Inter, Arial, sans-serif",
    padding: "40px",
  },

  topGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.12)",
    top: "-120px",
    right: "-120px",
    filter: "blur(20px)",
  },

  bottomGlow: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.10)",
    bottom: "-100px",
    left: "-100px",
    filter: "blur(20px)",
  },

  container: {
    maxWidth: "1450px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.12)",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "18px",
  },

  heading: {
    fontSize: "52px",
    lineHeight: 1.1,
    color: "#0f172a",
    marginBottom: "18px",
  },

  subText: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: "#475569",
    maxWidth: "700px",
  },

  statusCard: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "18px",
    padding: "18px 22px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow:
      "0 15px 35px rgba(15,23,42,0.06)",

    display: "flex",
    alignItems: "center",
    gap: "12px",

    fontWeight: "700",
    color: "#0f172a",
  },

  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
    marginBottom: "24px",
  },

  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "28px",
    marginBottom: "24px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  sectionHeader: {
    marginBottom: "20px",
  },

  cardTitle: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "6px",
  },

  cardSubtitle: {
    color: "#64748b",
    fontSize: "14px",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: "14px",
    minWidth: "320px",
    outline: "none",
  },

  chartWrapper: {
    marginTop: "10px",
  },

  pieWrapper: {
    width: "320px",
    height: "320px",
    margin: "auto",
  },

  alertCard: {
    padding: "24px",
    marginBottom: "24px",
    borderRadius: "24px",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  alertTitle: {
    fontSize: "24px",
    marginBottom: "10px",
    color: "#0f172a",
  },

  alertText: {
    fontSize: "15px",
    color: "#334155",
    marginBottom: "6px",
  },

  alertValue: {
    fontWeight: "700",
    fontSize: "15px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  boldText: {
    fontWeight: "700",
    color: "#0f172a",
  },

  efficiencyBadge: {
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },

  dangerBadge: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },

  normalBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "13px",
  },
};

export default Analytics;