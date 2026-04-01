import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function ShiftList() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [unit, setUnit] = useState("");

  /* ================= FETCH SHIFTS ================= */
  const fetchShifts = async () => {
    try {
      setLoading(true);

      let query = [];

      if (date) query.push(`date=${date}`);
      if (status) query.push(`status=${status}`);
      if (unit) query.push(`unit=${unit}`);

      const url = `/shifts${query.length ? "?" + query.join("&") : ""}`;

      const res = await api.get(url);

      setShifts(res.data.data);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch shifts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  /* ================= ACTION HANDLERS ================= */

  const handleSubmit = async (id) => {
    try {
      await api.put(`/shifts/submit/${id}`);
      alert("Shift submitted");
      fetchShifts();
    } catch (err) {
      console.error(err);
      alert("Submit failed");
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/shifts/approve/${id}`);
      alert("Shift approved");
      fetchShifts();
    } catch (err) {
      console.error(err);
      alert("Approve failed");
    }
  };

  const handleLock = async (id) => {
    try {
      await api.put(`/shifts/lock/${id}`);
      alert("Shift locked");
      fetchShifts();
    } catch (err) {
      console.error(err);
      alert("Lock failed");
    }
  };

  const handleDownloadPDF = async (id) => {
  try {
    const res = await api.get(`/reports/shift/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shift-report.pdf");

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error(error);
    alert("Failed to download PDF");
  }
};

  /* ================= STYLES ================= */

  const getStatusStyle = (status) => {
    if (status === "draft")
      return { background: "#e3f2fd", color: "#1976d2" };

    if (status === "submitted")
      return { background: "#fff3e0", color: "#ef6c00" };

    if (status === "approved")
      return { background: "#e8f5e9", color: "#2e7d32" };

    if (status === "locked")
      return { background: "#eceff1", color: "#455a64" };

    return {};
  };

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40 }}>
      <h2>Shift List</h2>

      {/* FILTER */}
      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="locked">Locked</option>
        </select>

        <input
          placeholder="Unit ID"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
        />

        <button onClick={fetchShifts} style={btnPrimary}>
          Apply
        </button>

        <button
          onClick={() => {
            setDate("");
            setStatus("");
            setUnit("");
            fetchShifts();
          }}
          style={btnSecondary}
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading shifts...</p>
      ) : shifts.length === 0 ? (
        <p>No shifts found</p>
      ) : (
        <table style={tableStyle}>
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
                  (e.currentTarget.style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
              >
                <td style={td}>
                  {s.date
                    ? new Date(s.date).toLocaleDateString()
                    : "N/A"}
                </td>

                <td style={td}>{s.shiftType || "N/A"}</td>

                <td style={td}>{s.unit?.name || "N/A"}</td>

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
                    {s.status?.toUpperCase()}
                  </span>
                </td>

                <td style={td}>
                  {/* OPEN */}
                  <button
                    onClick={() => navigate(`/shifts/${s._id}`)}
                    style={btnPrimary}
                  >
                    Open
                  </button>

                  {/* REPORT */}
                  <button
                    onClick={() => navigate(`/report/${s._id}`)}
                    style={btnSecondary}
                    disabled={s.status === "draft"}
                  >
                    Report
                  </button>

                  <button
  onClick={() => handleDownloadPDF(s._id)}
  style={btnSuccess}
  disabled={s.status === "draft"}
>
  PDF
</button>
                  {/* ROLE-BASED ACTIONS */}

                  {role === "operator" && s.status === "draft" && (
                    <button
                      onClick={() => handleSubmit(s._id)}
                      style={btnSuccess}
                    >
                      Submit
                    </button>
                  )}

                  {role === "shift_incharge" &&
                    s.status === "submitted" && (
                      <button
                        onClick={() => handleApprove(s._id)}
                        style={btnSuccess}
                      >
                        Approve
                      </button>
                    )}

                  {(role === "hod" || role === "admin") &&
                    s.status === "approved" && (
                      <button
                        onClick={() => handleLock(s._id)}
                        style={btnSuccess}
                      >
                        Lock
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
};

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

const btnPrimary = {
  padding: "6px 10px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const btnSecondary = {
  padding: "6px 10px",
  background: "#6c757d",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

const btnSuccess = {
  padding: "6px 10px",
  background: "#2e7d32",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginRight: "5px",
};

export default ShiftList;