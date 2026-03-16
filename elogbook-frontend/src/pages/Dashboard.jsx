import { useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");

        setData(res.data.data);
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <p style={styles.message}>Loading dashboard...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  const shifts = data?.shifts || {};
  const issues = data?.issues || {};
  const events = data?.events || {};
  const parameterEntries = data?.parameterEntries || {};

  const issueData = {
    labels: ["Open", "WIP", "Closed"],
    datasets: [
      {
        label: "Issues",
        data: [issues.open ?? 0, issues.wip ?? 0, issues.closed ?? 0],
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e"],
      },
    ],
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Plant Operations Dashboard</h2>

      {/* Metric Cards */}
      <div style={styles.grid}>
        <Card title="Shifts Today" value={shifts.today ?? 0} />
        <Card title="Open Issues" value={issues.open ?? 0} />
        <Card title="Issues In Progress" value={issues.wip ?? 0} />
        <Card title="Closed Issues" value={issues.closed ?? 0} />
        <Card title="Events Today" value={events.today ?? 0} />
        <Card title="Parameter Entries" value={parameterEntries.today ?? 0} />
      </div>

      {/* Chart Section */}
      <div style={styles.chartSection}>
        <div style={styles.chartBox}>
          <h4>Issue Status Distribution</h4>

          <Pie data={issueData} />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={styles.actions}>
        <button
          style={styles.primaryBtn}
          onClick={() => navigate("/create-shift")}
        >
          Create Shift
        </button>

        <button style={styles.secondaryBtn} onClick={() => navigate("/shifts")}>
          View Shifts
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    background: "#f4f6f8",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
  },

  chartSection: {
    marginTop: "40px",
    display: "flex",
    gap: "40px",
  },

  chartBox: {
    width: "320px",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },

  actions: {
    marginTop: "30px",
    display: "flex",
    gap: "15px",
  },

  primaryBtn: {
    padding: "10px 18px",
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "10px 18px",
    border: "none",
    background: "#64748b",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
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
