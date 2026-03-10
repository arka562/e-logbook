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

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  const shifts = data?.shifts || {};
  const issues = data?.issues || {};
  const events = data?.events || {};
  const parameterEntries = data?.parameterEntries || {};

  return (
    <div style={{ padding: 40 }}>
      <h2>Plant Dashboard</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 220px)",
          gap: "20px",
        }}
      >
        <Card title="Total Shifts Today" value={shifts.today} />
        <Card title="Open Issues" value={issues.open} />
        <Card title="Issues In Progress" value={issues.wip} />
        <Card title="Closed Issues" value={issues.closed} />
        <Card title="Events Today" value={events.today} />
        <Card title="Parameter Entries Today" value={parameterEntries.today} />
      </div>
    </div>
  );
}

export default Dashboard;
