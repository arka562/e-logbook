import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ShiftDetails() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [parameters, setParameters] = useState([]);
  const [values, setValues] = useState({});
  const [eventText, setEventText] = useState("");
  const [issueText, setIssueText] = useState("");
  const [issuePriority, setIssuePriority] = useState("medium");
  const [closureRemarksByIssue, setClosureRemarksByIssue] = useState({});
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [handoverRemarks, setHandoverRemarks] = useState("");

  const [parameterCategory, setParameterCategory] = useState("shift_parameters");

  const plantId = report?.shift?.plant?._id;
  const isLocked = report?.shift?.status === "locked";

  // ================= FETCH REPORT =================
  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/shift/${id}`);
      const reportData = res.data.data || null;

      setReport(reportData);
      setHandoverRemarks(reportData?.shift?.handoverRemarks || "");
    } catch (error) {
      console.error(error);
      alert("Failed to load report");
    }
  };

  const fetchParameters = async (plantIdValue, categoryValue) => {
    try {
      const res = await api.get("/parameters/templates", {
        params: {
          category: categoryValue,
          plant: plantIdValue,
        },
      });

      setParameters(res.data?.data || []);
    } catch (error) {
      console.error(error);
      setParameters([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/admin/departments");
      setDepartments(res.data.data || []);
    } catch (err) {
      console.error("Dept fetch error", err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchReport(), fetchDepartments()]);
    };

    loadInitialData();
  }, [id]);

  useEffect(() => {
    const loadParameters = async () => {
      if (plantId) {
        await fetchParameters(plantId, parameterCategory);
      }
    };

    loadParameters();
  }, [plantId, parameterCategory]);

  const handleChange = (paramId, field, value) => {
    setValues({
      ...values,
      [paramId]: {
        ...values[paramId],
        [field]: value,
      },
    });
  };

  // ================= SAVE PARAM =================
  const saveParameter = async (paramId) => {
    try {
      const v = values[paramId];

      await api.post("/entries", {
        shiftId: id,
        parameterId: paramId,
        unit1Value: v?.unit1 || "",
        unit2Value: v?.unit2 || "",
      });

      alert("Parameter saved");
    } catch (error) {
      console.error(error);
      alert("Save failed");
    }
  };

  // ================= SAVE HANDOVER =================
  const saveHandoverRemarks = async () => {
    if (!handoverRemarks.trim()) {
      alert("Please enter handover remarks");
      return;
    }

    try {
      await api.patch(`/shifts/${id}/handover`, {
        handoverRemarks,
      });

      alert("Handover remarks saved");
      fetchReport();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to save handover remarks");
    }
  };

  // ================= ADD EVENT =================
  const addEvent = async () => {
    if (!eventText.trim()) {
      alert("Please enter event description");
      return;
    }

    if (!report?.shift?.unit?._id) {
      alert("Unit not available");
      return;
    }

    try {
      await api.post("/events", {
        shiftId: report.shift._id,
        unitId: report.shift.unit._id,
        description: eventText,
      });

      setEventText("");
      fetchReport();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to add event");
    }
  };

  // ================= ADD ISSUE =================
  const addIssue = async () => {
    if (!issueText.trim()) {
      alert("Please enter issue description");
      return;
    }

    if (!selectedDepartment) {
      alert("Please select department");
      return;
    }

    if (!report?.shift?.unit?._id) {
      alert("Unit not available");
      return;
    }

    try {
      await api.post("/issues", {
        shiftId: report.shift._id,
        unitId: report.shift.unit._id,
        equipment: "Equipment",
        description: issueText,
        department: selectedDepartment,
        priority: issuePriority,
      });

      setIssueText("");
      setSelectedDepartment("");
      setIssuePriority("medium");
      fetchReport();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to add issue");
    }
  };

  // ================= ISSUE STATUS UPDATE =================
  const updateIssueStatus = async (issueId, newStatus, closureRemarks = "") => {
    if (newStatus === "closed" && !closureRemarks.trim()) {
      alert("Please enter closure remarks");
      return;
    }

    try {
      await api.patch(`/issues/${issueId}/status`, {
        status: newStatus,
        closureRemarks,
      });

      setClosureRemarksByIssue({
        ...closureRemarksByIssue,
        [issueId]: "",
      });

      fetchReport();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to update issue status");
    }
  };

  if (!report) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>Shift Logbook</h2>

      {/* SHIFT INFO */}
      <div style={styles.card}>
        <p><b>Plant:</b> {report.shift?.plant?.name || "N/A"}</p>
        <p><b>Unit:</b> {report.shift?.unit?.name || "N/A"}</p>
        <p><b>Shift:</b> {report.shift?.shiftType || "N/A"}</p>
        <p><b>Status:</b> {report.shift?.status?.toUpperCase?.() || "N/A"}</p>
      </div>

      {/* HANDOVER */}
      <div style={styles.card}>
        <h3>Shift Handover</h3>

        <textarea
          value={handoverRemarks}
          placeholder="Write key observations, pending work, safety notes, or instructions for the next shift"
          disabled={isLocked}
          onChange={(e) => setHandoverRemarks(e.target.value)}
          style={styles.textarea}
        />

        {!isLocked && (
          <button onClick={saveHandoverRemarks} style={styles.btn}>
            Save Handover
          </button>
        )}
      </div>

      {/* EVENTS */}
      <div style={styles.card}>
        <h3>Events</h3>

        {!isLocked && (
          <div style={styles.inputRow}>
            <input
              value={eventText}
              placeholder="Event description"
              onChange={(e) => setEventText(e.target.value)}
              style={styles.input}
            />
            <button onClick={addEvent} style={styles.btn}>
              Add Event
            </button>
          </div>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {report.events?.map((e) => (
              <tr key={e._id}>
                <td>{new Date(e.createdAt).toLocaleTimeString()}</td>
                <td>{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ISSUES */}
      <div style={styles.card}>
        <h3>Issues</h3>

        {!isLocked && (
          <div style={styles.inputRow}>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={styles.input}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            <input
              value={issueText}
              placeholder="Issue description"
              onChange={(e) => setIssueText(e.target.value)}
              style={styles.input}
            />

            <select
              value={issuePriority}
              onChange={(e) => setIssuePriority(e.target.value)}
              style={styles.input}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            <button onClick={addIssue} style={styles.btn}>
              Add Issue
            </button>
          </div>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Description</th>
              <th>Closure Remarks</th>
            </tr>
          </thead>
          <tbody>
            {report.issues?.map((i) => (
              <tr key={i._id}>
                <td>{i.equipment}</td>
                <td>
                  <span style={getPriorityStyle(i.priority)}>
                    {i.priority || "medium"}
                  </span>
                </td>
                <td>
                  <span style={getStatusStyle(i.status)}>{i.status}</span>

                  {!isLocked && (
                    <div style={{ marginTop: 5, display: "flex", gap: 5 }}>
                      {i.status === "open" && (
                        <button
                          onClick={() => updateIssueStatus(i._id, "wip")}
                          style={styles.smallBtn}
                        >
                          Mark WIP
                        </button>
                      )}

                      {i.status === "wip" && (
                        <>
                          <input
                            placeholder="Closure remarks"
                            value={closureRemarksByIssue[i._id] || ""}
                            onChange={(e) =>
                              setClosureRemarksByIssue({
                                ...closureRemarksByIssue,
                                [i._id]: e.target.value,
                              })
                            }
                            style={styles.smallInput}
                          />

                          <button
                            onClick={() =>
                              updateIssueStatus(
                                i._id,
                                "closed",
                                closureRemarksByIssue[i._id] || ""
                              )
                            }
                            style={styles.smallBtn}
                          >
                            Close
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
                <td>{i.description}</td>
                <td>{i.closureRemarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PARAMETERS */}
      <div style={styles.card}>
        <h3>Shift Parameters</h3>

        <div style={{ marginBottom: 15 }}>
          <select
            value={parameterCategory}
            onChange={(e) => setParameterCategory(e.target.value)}
            style={{ ...styles.input, maxWidth: 280 }}
          >
            <option value="shift_parameters">Shift Parameters</option>
            <option value="electrical">Electrical</option>
            <option value="switchyard">Switchyard</option>
            <option value="fire_system">Fire System</option>
            <option value="equipment_status">Equipment Status</option>
          </select>
        </div>

        {parameters.length === 0 ? (
          <p>No parameters found for this category.</p>
        ) : (
          parameters.map((p) => (
            <div key={p._id} style={styles.parameterRow}>
              <div style={styles.parameterName}>
                <b>{p.name}</b>
                <span style={styles.parameterMeta}>
                  {p.unit ? `Unit: ${p.unit}` : "No unit"}
                  {p.minValue !== undefined || p.maxValue !== undefined
                    ? ` | Safe: ${p.minValue ?? "-"} - ${p.maxValue ?? "-"}`
                    : ""}
                </span>
              </div>

              <div style={styles.valueBox}>
                <input
                  placeholder="Unit 1"
                  disabled={isLocked}
                  onChange={(e) => handleChange(p._id, "unit1", e.target.value)}
                  style={styles.input}
                />
                {getParameterValueStatus(values[p._id]?.unit1, p) && (
                  <span style={getParameterValueStatus(values[p._id]?.unit1, p).style}>
                    {getParameterValueStatus(values[p._id]?.unit1, p).label}
                  </span>
                )}
              </div>

              <div style={styles.valueBox}>
                <input
                  placeholder="Unit 2"
                  disabled={isLocked}
                  onChange={(e) => handleChange(p._id, "unit2", e.target.value)}
                  style={styles.input}
                />
                {getParameterValueStatus(values[p._id]?.unit2, p) && (
                  <span style={getParameterValueStatus(values[p._id]?.unit2, p).style}>
                    {getParameterValueStatus(values[p._id]?.unit2, p).label}
                  </span>
                )}
              </div>

              {!isLocked && (
                <button onClick={() => saveParameter(p._id)} style={styles.btn}>
                  Save
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  if (status === "open") return { color: "red" };
  if (status === "wip") return { color: "orange" };
  if (status === "closed") return { color: "green" };
  return {};
};

const getPriorityStyle = (priority) => {
  if (priority === "critical") return { ...styles.priorityBadge, background: "#fee2e2", color: "#991b1b" };
  if (priority === "high") return { ...styles.priorityBadge, background: "#ffedd5", color: "#9a3412" };
  if (priority === "low") return { ...styles.priorityBadge, background: "#e0f2fe", color: "#075985" };
  return { ...styles.priorityBadge, background: "#e2e8f0", color: "#334155" };
};

const getParameterValueStatus = (value, parameter) => {
  if (value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return {
      label: "Text value",
      style: styles.neutralBadge,
    };
  }

  if (parameter.minValue !== undefined && numericValue < parameter.minValue) {
    return {
      label: `Below min ${parameter.minValue}`,
      style: styles.dangerBadge,
    };
  }

  if (parameter.maxValue !== undefined && numericValue > parameter.maxValue) {
    return {
      label: `Above max ${parameter.maxValue}`,
      style: styles.dangerBadge,
    };
  }

  if (parameter.minValue !== undefined || parameter.maxValue !== undefined) {
    return {
      label: "Within range",
      style: styles.safeBadge,
    };
  }

  return null;
};

const styles = {
  container: { padding: 40 },
  card: { background: "#fff", padding: 20, marginBottom: 20, borderRadius: 8 },
  inputRow: { display: "flex", gap: 10, marginBottom: 15 },
  input: { flex: 1, padding: 8 },
  textarea: {
    width: "100%",
    minHeight: 110,
    padding: 10,
    resize: "vertical",
    marginBottom: 10,
    boxSizing: "border-box",
  },
  btn: { padding: "8px 12px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  parameterRow: { display: "flex", gap: 10, marginBottom: 10, alignItems: "center" },
  parameterName: {
    minWidth: 180,
  },
  parameterMeta: {
    display: "block",
    marginTop: 4,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 400,
  },
  valueBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  safeBadge: {
    color: "#166534",
    fontSize: 12,
    fontWeight: 700,
  },
  dangerBadge: {
    color: "#b91c1c",
    fontSize: 12,
    fontWeight: 700,
  },
  neutralBadge: {
    color: "#475569",
    fontSize: 12,
    fontWeight: 700,
  },
  smallBtn: {
    padding: "4px 8px",
    fontSize: "12px",
    border: "none",
    borderRadius: "4px",
    background: "#555",
    color: "#fff",
    cursor: "pointer",
  },
  smallInput: {
    padding: "4px 8px",
    fontSize: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "4px",
  },
  priorityBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
};

export default ShiftDetails;
