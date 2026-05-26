import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Card from "../components/Card";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        setData(res.data?.data || {});
        setLastUpdated(new Date().toLocaleString());
      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const shifts = data?.shifts || {};
  const issues = data?.issues || {};
  const events = data?.events || {};
  const parameterEntries = data?.parameterEntries || {};
  const pendingWork = data?.pendingWork || {};

  const issueTotal = useMemo(() => {
    return (issues.open ?? 0) + (issues.wip ?? 0) + (issues.closed ?? 0);
  }, [issues]);

  const issueData = {
    labels: ["Open", "WIP", "Closed"],
    datasets: [
      {
        label: "Issues",
        data: [issues.open ?? 0, issues.wip ?? 0, issues.closed ?? 0],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
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
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 18,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  if (loading) return <p style={styles.message}>Loading dashboard...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <div style={styles.bottomGlow} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <p style={styles.badge}>Plant Operations</p>
            <h2 style={styles.title}>Dashboard Overview</h2>
            <p style={styles.subtitle}>
              Monitor shifts, issues, events, and parameter activity from one clean view.
            </p>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.lastUpdatedCard}>
              <span style={styles.lastUpdatedLabel}>Last updated</span>
              <span style={styles.lastUpdatedValue}>
                {lastUpdated || "Just now"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          <Card title="Shifts Today" value={shifts.today ?? 0} />
          <Card title="Open Issues" value={issues.open ?? 0} />
          <Card title="Issues In Progress" value={issues.wip ?? 0} />
          <Card title="Closed Issues" value={issues.closed ?? 0} />
          <Card title="Events Today" value={events.today ?? 0} />
          <Card title="Parameter Entries" value={parameterEntries.today ?? 0} />
        </div>

        <div style={styles.middleGrid}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h3 style={styles.panelTitle}>Issue Status Distribution</h3>
                <p style={styles.panelSubtitle}>
                  Total issues logged: {issueTotal}
                </p>
              </div>
              <div style={styles.pill}>
                Live Summary
              </div>
            </div>

            <div style={styles.chartWrap}>
              <Pie data={issueData} options={pieOptions} />
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h3 style={styles.panelTitle}>Quick Metrics</h3>
                <p style={styles.panelSubtitle}>
                  Fast snapshot of current operations
                </p>
              </div>
            </div>

            <div style={styles.quickList}>
              <div style={styles.quickItem}>
                <span style={styles.quickLabel}>Operational load</span>
                <span style={styles.quickValue}>{shifts.today ?? 0} shifts</span>
              </div>

              <div style={styles.quickItem}>
                <span style={styles.quickLabel}>Open issue ratio</span>
                <span style={styles.quickValue}>
                  {issueTotal ? `${Math.round(((issues.open ?? 0) / issueTotal) * 100)}%` : "0%"}
                </span>
              </div>

              <div style={styles.quickItem}>
                <span style={styles.quickLabel}>Recent activity</span>
                <span style={styles.quickValue}>{events.today ?? 0} events</span>
              </div>

              <div style={styles.quickItem}>
                <span style={styles.quickLabel}>Parameter logging</span>
                <span style={styles.quickValue}>{parameterEntries.today ?? 0} entries</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.pendingPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h3 style={styles.panelTitle}>Pending Work</h3>
              <p style={styles.panelSubtitle}>
                Items that need attention from operations and management
              </p>
            </div>
            <div style={styles.pill}>Action Queue</div>
          </div>

          <div style={styles.pendingGrid}>
            <PendingList
              title="Pending Approvals"
              items={pendingWork.pendingApprovalShifts || []}
              emptyText="No shifts waiting for approval"
              renderItem={(shift) => (
                <>
                  <strong>Shift {shift.shiftType}</strong>
                  <span>{shift.plant?.name || "-"} / {shift.unit?.name || "-"}</span>
                  <button
                    style={styles.inlineBtn}
                    onClick={() => navigate(`/shifts/${shift._id}`)}
                  >
                    Open
                  </button>
                </>
              )}
            />

            <PendingList
              title="Critical Issues"
              items={pendingWork.criticalOpenIssues || []}
              emptyText="No open critical issues"
              renderItem={(issue) => (
                <>
                  <strong>{issue.equipment || "Equipment"}</strong>
                  <span>{issue.department?.name || "-"} / {issue.status}</span>
                  <span>{issue.description}</span>
                </>
              )}
            />

            <PendingList
              title="Missing Handovers"
              items={pendingWork.missingHandoverShifts || []}
              emptyText="All required handovers are filled"
              renderItem={(shift) => (
                <>
                  <strong>Shift {shift.shiftType}</strong>
                  <span>{shift.plant?.name || "-"} / {shift.unit?.name || "-"}</span>
                  <button
                    style={styles.inlineBtn}
                    onClick={() => navigate(`/shifts/${shift._id}`)}
                  >
                    Add Handover
                  </button>
                </>
              )}
            />

            <PendingList
              title="Older Than 24h"
              items={pendingWork.oldUnresolvedIssues || []}
              emptyText="No unresolved issues older than 24 hours"
              renderItem={(issue) => (
                <>
                  <strong>{issue.equipment || "Equipment"}</strong>
                  <span>{issue.department?.name || "-"} / {issue.status}</span>
                  <span>{issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "-"}</span>
                </>
              )}
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/create-shift")}
          >
            Create Shift
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/shifts")}
          >
            View Shifts
          </button>

          <button
            style={styles.tertiaryBtn}
            onClick={() => navigate("/analytics")}
          >
            Open Analytics
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingList({ title, items, emptyText, renderItem }) {
  return (
    <div style={styles.pendingCard}>
      <div style={styles.pendingTitleRow}>
        <h4 style={styles.pendingTitle}>{title}</h4>
        <span style={styles.pendingCount}>{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div style={styles.pendingEmpty}>{emptyText}</div>
      ) : (
        <div style={styles.pendingItems}>
          {items.map((item) => (
            <div key={item._id} style={styles.pendingItem}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 45%, #e2e8f0 100%)",
    fontFamily: "Arial, sans-serif",
  },
  topGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.12)",
    top: "-140px",
    right: "-120px",
    filter: "blur(20px)",
  },
  bottomGlow: {
    position: "absolute",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "rgba(16, 185, 129, 0.10)",
    bottom: "-120px",
    left: "-120px",
    filter: "blur(18px)",
  },
  container: {
    position: "relative",
    zIndex: 1,
    padding: "36px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "rgba(37, 99, 235, 0.10)",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "10px",
  },
  title: {
    margin: 0,
    fontSize: "36px",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "15px",
    maxWidth: "640px",
    lineHeight: 1.6,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  lastUpdatedCard: {
    minWidth: "180px",
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(148,163,184,0.25)",
    borderRadius: "16px",
    padding: "14px 16px",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(10px)",
  },
  lastUpdatedLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  },
  lastUpdatedValue: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },
  middleGrid: {
    marginTop: "24px",
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "18px",
    alignItems: "stretch",
  },
  panel: {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(10px)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "18px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "20px",
    color: "#0f172a",
  },
  panelSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  pill: {
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  chartWrap: {
    width: "100%",
    height: "340px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  quickList: {
    display: "grid",
    gap: "12px",
  },
  quickItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  quickLabel: {
    color: "#475569",
    fontSize: "14px",
  },
  quickValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 700,
  },
  pendingPanel: {
    marginTop: "24px",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(10px)",
  },
  pendingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },
  pendingCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
  },
  pendingTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  pendingTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "16px",
  },
  pendingCount: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 800,
  },
  pendingItems: {
    display: "grid",
    gap: "10px",
  },
  pendingItem: {
    display: "grid",
    gap: "4px",
    padding: "12px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.4,
  },
  pendingEmpty: {
    padding: "14px",
    borderRadius: "12px",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    background: "#fff",
    fontSize: "13px",
  },
  inlineBtn: {
    justifySelf: "start",
    marginTop: "6px",
    padding: "6px 10px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "12px",
  },
  actions: {
    marginTop: "24px",
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    padding: "12px 18px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "white",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(37, 99, 235, 0.20)",
  },
  secondaryBtn: {
    padding: "12px 18px",
    border: "none",
    background: "#64748b",
    color: "white",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  tertiaryBtn: {
    padding: "12px 18px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
  },
  message: {
    padding: 40,
    fontSize: 18,
  },
  error: {
    color: "red",
    padding: 40,
  },
};

export default Dashboard;
