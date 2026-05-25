import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";

function PredictiveMaintenance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/ml/predictive-maintenance");
      setData(res.data?.data || []);
    } catch (error) {
      console.log(error);
      setData([]);
      setError(error?.response?.data?.message || "Failed to load maintenance predictions");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const high = data.filter((d) => d.risk === "High").length;
    const medium = data.filter((d) => d.risk === "Medium").length;
    const low = data.filter((d) => d.risk === "Low").length;

    return { high, medium, low };
  }, [data]);

  const getBadgeStyle = (risk) => {
    if (risk === "High") {
      return {
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      };
    }

    if (risk === "Medium") {
      return {
        background: "#fef3c7",
        color: "#b45309",
        border: "1px solid #fde68a",
      };
    }

    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    };
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <p style={styles.badge}>AI Maintenance</p>
            <h3 style={styles.title}>Predictive Maintenance</h3>
            <p style={styles.subtitle}>
              Equipment risk analysis based on issue frequency.
            </p>
          </div>

          <button onClick={fetchData} style={styles.refreshBtn} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>High Risk</span>
            <span style={{ ...styles.summaryValue, color: "#b91c1c" }}>
              {summary.high}
            </span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Medium Risk</span>
            <span style={{ ...styles.summaryValue, color: "#b45309" }}>
              {summary.medium}
            </span>
          </div>

          <div style={styles.summaryCard}>
            <span style={styles.summaryLabel}>Low Risk</span>
            <span style={{ ...styles.summaryValue, color: "#166534" }}>
              {summary.low}
            </span>
          </div>
        </div>

        {error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : loading ? (
          <div style={styles.emptyState}>Loading predictions...</div>
        ) : data.length === 0 ? (
          <div style={styles.emptyState}>
            No maintenance predictions available
          </div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Equipment</th>
                  <th style={styles.th}>Issue Count</th>
                  <th style={styles.th}>Risk</th>
                </tr>
              </thead>

              <tbody>
                {data.map((d, i) => (
                  <tr
                    key={i}
                    style={{
                      background:
                        d.risk === "High"
                          ? "#fff1f2"
                          : d.risk === "Medium"
                          ? "#fffbeb"
                          : "#f0fdf4",
                    }}
                  >
                    <td style={styles.tdName}>{d.equipment}</td>
                    <td style={styles.td}>{d.issueCount}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.riskBadge, ...getBadgeStyle(d.risk) }}>
                        {d.risk}
                      </span>
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
    marginTop: 24,
  },
  card: {
    background: "rgba(255,255,255,0.84)",
    backdropFilter: "blur(14px)",
    padding: 24,
    borderRadius: 24,
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
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
  title: {
    margin: 0,
    fontSize: 26,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 0,
    color: "#64748b",
    fontSize: 14,
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
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  summaryCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 16,
  },
  summaryLabel: {
    display: "block",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 6,
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
    borderBottom: "1px solid #eef2f7",
    fontSize: 14,
    color: "#334155",
  },
  tdName: {
    padding: "14px 12px",
    borderBottom: "1px solid #eef2f7",
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 700,
  },
  riskBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
  },
  emptyState: {
    padding: 18,
    borderRadius: 14,
    background: "#f8fafc",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },
  errorBox: {
    padding: 14,
    borderRadius: 14,
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    fontWeight: 600,
    marginBottom: 14,
  },
};

export default PredictiveMaintenance;
