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

  const fetchTrend = async (paramId) => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/trends?parameterId=${paramId}`);
      setTrend(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching trend:", err);
      setTrend([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnomalies = async (paramId) => {
    try {
      setAnomalyLoading(true);
      const res = await api.get(`/ml/anomaly?parameterId=${paramId}`);
      setAnomalies(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching anomalies:", err);
      setAnomalies([]);
    } finally {
      setAnomalyLoading(false);
    }
  };

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

  const abnormal = useMemo(
    () => anomalies.filter((a) => a.anomaly === -1),
    [anomalies]
  );

  const highestAbnormalValue = useMemo(() => {
    if (!abnormal.length) return null;
    return Math.max(...abnormal.map((a) => Number(a.value)));
  }, [abnormal]);

  const lineData = {
    labels: trend.map((t) => new Date(t.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: "Parameter Trend",
        data: trend.map((t) => t.value),
        borderColor: "#2563eb",
        tension: 0.3,
      },
    ],
  };

  const pieData = {
    labels: issues.map((i) => i.equipment),
    datasets: [
      {
        data: issues.map((i) => i.count),
        backgroundColor: ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"],
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

  const selectedParameter = parameters.find((p) => p._id === selectedParam);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Analytics Dashboard</h2>

      <div style={styles.card}>
        <h3>Select Parameter</h3>
        <select
          value={selectedParam}
          onChange={(e) => setSelectedParam(e.target.value)}
          style={styles.input}
        >
          {parameters.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.unit || "unit"})
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          ...styles.alertCard,
          background: abnormal.length ? "#fee2e2" : "#dcfce7",
          color: abnormal.length ? "#b91c1c" : "#166534",
        }}
      >
        {abnormal.length > 0 ? (
          <>
            ⚠️ {abnormal.length} anomalies detected
            <br />
            Highest abnormal value: {highestAbnormalValue ?? "-"}{" "}
            {selectedParameter?.unit || ""}
          </>
        ) : anomalyLoading ? (
          <>Checking anomalies...</>
        ) : (
          <>✅ No anomalies detected</>
        )}
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Parameter Trend</h3>
          {loading ? <p>Loading...</p> : <Line data={lineData} />}
        </div>

        <div style={styles.card}>
          <h3>Issue Distribution</h3>
          <div style={{ width: "300px", height: "300px", margin: "auto" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3>Efficiency</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Actual</th>
              <th>Design</th>
              <th>Efficiency %</th>
            </tr>
          </thead>
          <tbody>
            {efficiency.length ? (
              efficiency.map((e, i) => (
                <tr key={i}>
                  <td>{e.parameterName}</td>
                  <td>{e.actual}</td>
                  <td>{e.design}</td>
                  <td>{e.efficiency}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={styles.card}>
        <h3>Anomaly Detection</h3>
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
                    background: a.anomaly === -1 ? "#fee2e2" : "white",
                  }}
                >
                  <td>{a.value}</td>
                  <td>{a.anomaly === -1 ? "⚠️ Abnormal" : "Normal"}</td>
                  <PredictiveMaintenance />
                </tr>
                
              ))
              
            ) : (
              <tr>
                <td colSpan="2">No anomaly data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    background: "#f4f6f8",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 20,
  },
  card: {
    background: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  alertCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    fontWeight: "bold",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
    minWidth: 280,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default Analytics;