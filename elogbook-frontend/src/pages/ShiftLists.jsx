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

      setShifts(res.data.data || []);

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

  /* ================= ACTIONS ================= */

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

      const url = window.URL.createObjectURL(
        new Blob([res.data])
      );

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

  /* ================= STATUS STYLE ================= */

  const getStatusStyle = (status) => {
    if (status === "draft") {
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };
    }

    if (status === "submitted") {
      return {
        background: "#fef3c7",
        color: "#92400e",
      };
    }

    if (status === "approved") {
      return {
        background: "#dcfce7",
        color: "#166534",
      };
    }

    if (status === "locked") {
      return {
        background: "#e2e8f0",
        color: "#334155",
      };
    }

    return {};
  };

  /* ================= UI ================= */

  return (
    <div style={styles.page}>
      <div style={styles.topGlow}></div>
      <div style={styles.bottomGlow}></div>

      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>
              Shift Operations
            </div>

            <h1 style={styles.heading}>
              Industrial Shift Management
            </h1>

            <p style={styles.subText}>
              Monitor, approve, lock, and manage
              industrial shifts with role-based workflow.
            </p>
          </div>

          <button
            style={styles.createBtn}
            onClick={() => navigate("/create-shift")}
          >
            + Create Shift
          </button>
        </div>

        {/* FILTERS */}
        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div>
              <h2 style={styles.filterTitle}>
                Filter Shifts
              </h2>

              <p style={styles.filterSubtitle}>
                Search and manage operational shifts
              </p>
            </div>
          </div>

          <div style={styles.filterGrid}>
            {/* DATE */}
            <div style={styles.field}>
              <label style={styles.label}>
                Shift Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
                style={styles.input}
              />
            </div>

            {/* STATUS */}
            <div style={styles.field}>
              <label style={styles.label}>
                Shift Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                style={styles.input}
              >
                <option value="">
                  All Status
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="submitted">
                  Submitted
                </option>

                <option value="approved">
                  Approved
                </option>

                <option value="locked">
                  Locked
                </option>
              </select>
            </div>

            {/* UNIT */}
            <div style={styles.field}>
              <label style={styles.label}>
                Unit ID
              </label>

              <input
                placeholder="Enter Unit ID"
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value)
                }
                style={styles.input}
              />
            </div>

            {/* ACTIONS */}
            <div style={styles.actionBox}>
              <button
                onClick={fetchShifts}
                style={styles.applyBtn}
              >
                Apply Filters
              </button>

              <button
                onClick={() => {
                  setDate("");
                  setStatus("");
                  setUnit("");

                  fetchShifts();
                }}
                style={styles.resetBtn}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <div>
              <h2 style={styles.tableTitle}>
                Shift Records
              </h2>

              <p style={styles.tableSubtitle}>
                Total shifts: {shifts.length}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={styles.loaderWrap}>
              <div style={styles.loader}></div>
              <p>Loading shifts...</p>
            </div>
          ) : shifts.length === 0 ? (
            <div style={styles.emptyState}>
              No shifts found
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
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
                      style={styles.row}
                    >
                      {/* DATE */}
                      <td style={td}>
                        <span style={styles.dateBadge}>
                          {s.date
                            ? new Date(
                                s.date
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>

                      {/* SHIFT */}
                      <td style={tdBold}>
                        Shift {s.shiftType || "N/A"}
                      </td>

                      {/* UNIT */}
                      <td style={td}>
                        {s.unit?.name || "N/A"}
                      </td>

                      {/* STATUS */}
                      <td style={td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...getStatusStyle(
                              s.status
                            ),
                          }}
                        >
                          {s.status?.toUpperCase()}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={td}>
                        <div style={styles.actionButtons}>
                          {/* OPEN */}
                          <button
                            onClick={() =>
                              navigate(
                                `/shifts/${s._id}`
                              )
                            }
                            style={styles.primaryBtn}
                          >
                            Open
                          </button>

                          {/* REPORT */}
                          <button
                            onClick={() =>
                              navigate(
                                `/report/${s._id}`
                              )
                            }
                            style={styles.secondaryBtn}
                            disabled={
                              s.status === "draft"
                            }
                          >
                            Report
                          </button>

                          {/* PDF */}
                          <button
                            onClick={() =>
                              handleDownloadPDF(
                                s._id
                              )
                            }
                            style={styles.successBtn}
                            disabled={
                              s.status === "draft"
                            }
                          >
                            PDF
                          </button>

                          {/* OPERATOR */}
                          {role === "operator" &&
                            s.status === "draft" && (
                              <button
                                onClick={() =>
                                  handleSubmit(
                                    s._id
                                  )
                                }
                                style={
                                  styles.warningBtn
                                }
                              >
                                Submit
                              </button>
                            )}

                          {/* SHIFT INCHARGE */}
                          {role ===
                            "shift_incharge" &&
                            s.status ===
                              "submitted" && (
                              <button
                                onClick={() =>
                                  handleApprove(
                                    s._id
                                  )
                                }
                                style={
                                  styles.successBtn
                                }
                              >
                                Approve
                              </button>
                            )}

                          {/* HOD / ADMIN */}
                          {(role === "hod" ||
                            role === "admin") &&
                            s.status ===
                              "approved" && (
                              <button
                                onClick={() =>
                                  handleLock(
                                    s._id
                                  )
                                }
                                style={
                                  styles.dangerBtn
                                }
                              >
                                Lock
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#f8fafc 0%,#eef2ff 50%,#e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "40px",
    fontFamily: "Inter, Arial, sans-serif",
  },

  topGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.12)",
    top: "-120px",
    right: "-120px",
    filter: "blur(20px)",
  },

  bottomGlow: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.10)",
    bottom: "-100px",
    left: "-100px",
    filter: "blur(20px)",
  },

  container: {
    maxWidth: "1450px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.12)",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "18px",
  },

  heading: {
    fontSize: "52px",
    lineHeight: 1.1,
    color: "#0f172a",
    marginBottom: "16px",
  },

  subText: {
    fontSize: "16px",
    lineHeight: 1.8,
    color: "#475569",
    maxWidth: "720px",
  },

  createBtn: {
    padding: "14px 20px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 12px 24px rgba(37,99,235,0.22)",
  },

  filterCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "28px",
    marginBottom: "24px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  filterHeader: {
    marginBottom: "20px",
  },

  filterTitle: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "6px",
  },

  filterSubtitle: {
    color: "#64748b",
    fontSize: "14px",
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "18px",
    alignItems: "end",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },

  input: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
  },

  actionBox: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  applyBtn: {
    padding: "14px 18px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",
    color: "#fff",
    fontWeight: "700",
    cursor: "pointer",
  },

  resetBtn: {
    padding: "14px 18px",
    border: "none",
    borderRadius: "14px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontWeight: "700",
    cursor: "pointer",
  },

  tableCard: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "28px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow:
      "0 20px 50px rgba(15,23,42,0.08)",
  },

  tableHeader: {
    marginBottom: "20px",
  },

  tableTitle: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "6px",
  },

  tableSubtitle: {
    color: "#64748b",
    fontSize: "14px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  row: {
    transition: "0.2s",
  },

  statusBadge: {
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "700",
    fontSize: "12px",
  },

  dateBadge: {
    background: "#f1f5f9",
    padding: "7px 12px",
    borderRadius: "999px",
    fontWeight: "600",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  primaryBtn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  secondaryBtn: {
    padding: "8px 12px",
    background: "#64748b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  successBtn: {
    padding: "8px 12px",
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  warningBtn: {
    padding: "8px 12px",
    background: "#f59e0b",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  dangerBtn: {
    padding: "8px 12px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  loaderWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    padding: "40px",
    color: "#64748b",
  },

  loader: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "4px solid #dbeafe",
    borderTop: "4px solid #2563eb",
    animation: "spin 1s linear infinite",
  },

  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#f8fafc",
  },
};

const th = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  color: "#334155",
  fontSize: "14px",
};

const td = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
  color: "#475569",
};

const tdBold = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
  fontWeight: "700",
  color: "#0f172a",
};

export default ShiftList;