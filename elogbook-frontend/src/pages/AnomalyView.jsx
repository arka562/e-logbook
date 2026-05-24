import { useEffect, useState } from "react";
import api from "../api/axios";

function AnomalyView({ parameterId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      setMessage("");

      const res = await api.get(`/ml/anomaly?parameterId=${parameterId}`);
      setRows(res.data?.data || []);
    } catch (error) {
      console.error(error);
      setRows([]);
      setMessage(
        error?.response?.data?.message || "Failed to load anomaly data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parameterId) {
      fetchAnomalies();
    }
  }, [parameterId]);

  const anomalyCount = rows.filter((row) => row.anomaly === -1).length;
  const normalCount = rows.length - anomalyCount;

  if (!parameterId) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h3 style={styles.title}>Anomaly Detection</h3>
          <p style={styles.helperText}>
            Select a parameter to view anomaly detection results.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <p style={styles.badge}>AI Monitoring</p>
          <h2 style={styles.heading}>Anomaly Detection</h2>
          <p style={styles.subText}>
            Isolation Forest based anomaly analysis for industrial parameter readings.
          </p>
        </div>

        <button onClick={fetchAnomalies} style={styles.refreshBtn} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Readings</span>
          <span style={styles.statValue}>{rows.length}</span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Normal</span>
          <span style={{ ...styles.statValue, color: "#166534" }}>
            {normalCount}
          </span>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Anomalies</span>
          <span style={{ ...styles.statValue, color: "#b91c1c" }}>
            {anomalyCount}
          </span>
        </div>
      </div>

      <div style={styles.card}>
        {loading ? (
          <div style={styles.centerBlock}>
            <div style={styles.loader} />
            <p style={styles.helperText}>Loading anomaly data...</p>
          </div>
        ) : message ? (
          <div style={styles.centerBlock}>
            <div style={styles.errorBox}>{message}</div>
          </div>
        ) : rows.length === 0 ? (
          <div style={styles.centerBlock}>
            <div style={styles.emptyState}>
              No anomaly data available
            </div>
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Value</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    style={{
                      background: row.anomaly === -1 ? "#fff1f2" : "#ffffff",
                    }}
                  >
                    <td style={styles.td}>
                      <span style={styles.valueChip}>{row.value}</span>
                    </td>
                    <td style={styles.td}>
                      {row.anomaly === -1 ? (
                        <span style={styles.badgeDanger}>⚠️ Anomaly</span>
                      ) : (
                        <span style={styles.badgeSuccess}>Normal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 24,
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
    minHeight: "100vh",
    fontFamily: "Inter, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 10,
  },
  heading: {
    margin: 0,
    fontSize: 32,
    color: "#0f172a",
  },
  subText: {
    marginTop: 8,
    marginBottom: 0,
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 700,
  },
  refreshBtn: {
    padding: "12px 16px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.18)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
    marginBottom: 20,
  },
  statCard: {
    background: "#fff",
    borderRadius: 18,
    padding: 18,
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.05)",
  },
  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
  },
  card: {
    background: "#fff",
    borderRadius: 22,
    padding: 22,
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  },
  title: {
    margin: 0,
    fontSize: 24,
    color: "#0f172a",
  },
  helperText: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
  },
  centerBlock: {
    minHeight: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loader: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    animation: "spin 1s linear infinite",
  },
  errorBox: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontWeight: 600,
    textAlign: "center",
  },
  emptyState: {
    padding: "18px 16px",
    borderRadius: 14,
    background: "#f8fafc",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
    width: "100%",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: 14,
  },
  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
  },
  valueChip: {
    display: "inline-block",
    minWidth: 80,
    textAlign: "center",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#f8fafc",
    color: "#0f172a",
    fontWeight: 700,
  },
  badgeDanger: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 700,
    fontSize: 13,
  },
  badgeSuccess: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 700,
    fontSize: 13,
  },
};

export default AnomalyView;