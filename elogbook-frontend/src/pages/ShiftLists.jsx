import { useEffect, useState } from "react";
import api from "../api/axios";

function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchShifts = async () => {
    try {
      setLoading(true);

      const url = date ? `/shifts?date=${date}` : "/shifts";

      const res = await api.get(url);
      setShifts(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const getStatusStyle = (status) => {
    if (status === "OPEN") return { background: "#ffebee", color: "#c62828" };

    if (status === "CLOSED") return { background: "#e8f5e9", color: "#2e7d32" };

    return { background: "#e3f2fd", color: "#1976d2" };
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Shift List</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />

        <button
          onClick={fetchShifts}
          style={{
            padding: "8px 15px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Filter
        </button>
      </div>

      {loading ? (
        <p>Loading shifts...</p>
      ) : shifts.length === 0 ? (
        <p>No shifts found</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <thead>
            <tr style={{ background: "#f1f3f5" }}>
              <th style={th}>Date</th>
              <th style={th}>Shift</th>
              <th style={th}>Unit</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {shifts.map((s) => (
              <tr
                key={s._id}
                style={tr}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <td style={td}>{new Date(s.date).toLocaleDateString()}</td>

                <td style={td}>{s.shiftType}</td>

                <td style={td}>{s.unit?.name}</td>

                <td style={td}>
                  <span
                    style={{
                      ...getStatusStyle(s.status),
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    {s.status}
                  </span>
                </td>

                <td style={td}>
                  <button
                    style={{
                      padding: "6px 10px",
                      background: "#2e7d32",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(
                        `http://localhost:5000/api/reports/shift/${s._id}/pdf`,
                      )
                    }
                  >
                    Download PDF
                  </button>
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
  padding: "12px",
  borderBottom: "1px solid #ddd",
  textAlign: "left",
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const tr = {
  transition: "0.2s",
};

export default ShiftList;
