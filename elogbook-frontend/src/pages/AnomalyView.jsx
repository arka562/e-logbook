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

      // backend returns: { success, count, data }
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

  return (
    <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
      <h3>Anomaly Detection</h3>

      {loading ? (
        <p>Loading...</p>
      ) : message ? (
        <p style={{ color: "crimson" }}>{message}</p>
      ) : rows.length === 0 ? (
        <p>No anomaly data available</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={th}>Value</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  background: row.anomaly === -1 ? "#fee2e2" : "white",
                }}
              >
                <td style={td}>{row.value}</td>
                <td style={td}>
                  {row.anomaly === -1 ? "⚠️ Anomaly" : "Normal"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = {
  padding: 10,
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const td = {
  padding: 10,
  borderBottom: "1px solid #eee",
};

export default AnomalyView;