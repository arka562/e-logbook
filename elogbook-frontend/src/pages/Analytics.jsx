import { useEffect, useState } from "react";
import api from "../api/axios";

import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
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

  // ================= STATE =================
  const [parameters, setParameters] = useState([]);
  const [selectedParam, setSelectedParam] = useState("");

  const [trend, setTrend] = useState([]);
  const [efficiency, setEfficiency] = useState([]);
  const [issues, setIssues] = useState([]);

  // ================= INITIAL LOAD =================
  useEffect(() => {
    fetchParameters();
    fetchStaticData();
  }, []);

  // ================= FETCH PARAMETERS =================
  const fetchParameters = async () => {
    try {
      const res = await api.get("/analytics/parameters");

      setParameters(res.data.data);

      // auto select first parameter
      if (res.data.data.length > 0) {
        setSelectedParam(res.data.data[0]._id);
      }

    } catch (err) {
      console.log("Error fetching parameters:", err);
    }
  };

  // ================= FETCH TREND =================
  useEffect(() => {
    if (selectedParam) {
      fetchTrend(selectedParam);
    }
  }, [selectedParam]);

  const fetchTrend = async (paramId) => {
    try {
      const res = await api.get(
        `/analytics/trends?parameterId=${paramId}`
      );

      setTrend(res.data.data);

    } catch (err) {
      console.log("Error fetching trend:", err);
    }
  };

  // ================= FETCH OTHER DATA =================
  const fetchStaticData = async () => {
    try {
      const effRes = await api.get("/analytics/efficiency");
      const issueRes = await api.get("/analytics/issues");

      setEfficiency(effRes.data.data);
      setIssues(issueRes.data.data);

    } catch (err) {
      console.log("Error fetching analytics:", err);
    }
  };

  const pieOptions = {
  responsive: true,
  maintainAspectRatio: false, // 🔥 allows custom size
  plugins: {
    legend: {
      position: "bottom", // cleaner look
    },
  },
};

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
        tension: 0.3
      }
    ]
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
          "#8b5cf6"
        ]
      }
    ]
  };

  // ================= UI =================

  return (
    <div style={{ padding: 40, background: "#f3f4f6" }}>

      <h2>📊 Analytics Dashboard</h2>

      {/* PARAMETER SELECTOR */}
      <div style={card}>
        <h3>Select Parameter</h3>

        <select
          value={selectedParam}
          onChange={(e) => setSelectedParam(e.target.value)}
          style={{ padding: 10, borderRadius: 5 }}
        >
          {parameters.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} ({p.unit})
            </option>
          ))}
        </select>
      </div>

      {/* TREND */}
      <div style={card}>
        <h3>Parameter Trend</h3>
        {trend.length ? (
          <Line data={lineData} />
        ) : (
          <p>No trend data available</p>
        )}
      </div>

      <div style={card}>
  <h3>Issue Distribution</h3>

  {issues.length ? (
    <div style={{ width: "300px", height: "300px", margin: "auto" }}>
      <Pie data={pieData} options={pieOptions} />
    </div>
  ) : (
    <p>No issue data available</p>
  )}
</div>

      {/* EFFICIENCY TABLE */}
      <div style={card}>
        <h3>Efficiency</h3>

        <table style={tableStyle}>
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

    </div>
  );
}

// ================= STYLES =================

const card = {
  background: "white",
  padding: 20,
  marginBottom: 20,
  borderRadius: 10,
  boxShadow: "0 0 10px rgba(0,0,0,0.1)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

export default Analytics;