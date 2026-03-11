import { useEffect, useState } from "react";
import api from "../api/axios";
import Card from "../components/Card";

function Dashboard() {
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

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Plant Operations Dashboard</h2>

      <div style={styles.grid}>
        <Card title="Shifts Today" value={shifts.today} />
        <Card title="Open Issues" value={issues.open} />
        <Card title="Issues In Progress" value={issues.wip} />
        <Card title="Closed Issues" value={issues.closed} />
        <Card title="Events Today" value={events.today} />
        <Card title="Parameter Entries" value={parameterEntries.today} />
      </div>
      <button onClick={() => (window.location.href = "/create-shift")}>
        Create Shift
      </button>
      <button onClick={() => (window.location.href = "/shifts")}>
        View Shifts
      </button>
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
