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
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // ================= FETCH REPORT =================
  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/shift/${id}`);
      const data = res.data.data;

      setReport(data);

      if (data?.shift?.plant?._id) {
        fetchParameters(data.shift.plant._id);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load report");
    }
  };

  const fetchParameters = async (plantId) => {
    try {
      const res = await api.get(
        `/parameters/templates?category=shift_parameters&plant=${plantId}`
      );
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
    fetchReport();
    fetchDepartments();
  }, [id]);

  const isLocked = report?.shift?.status === "locked";

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
      await api.post("/event", {
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
      });

      setIssueText("");
      setSelectedDepartment("");
      fetchReport();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to add issue");
    }
  };

  const updateIssueStatus = async (issueId, newStatus) => {
  try {
    await api.patch(`/issues/${issueId}/status`, {
      status: newStatus,
    });

    fetchReport(); // refresh UI

  } catch (error) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Failed to update issue status"
    );
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
        <p><b>Shift:</b> {report.shift?.shiftType}</p>
        <p><b>Status:</b> {report.shift?.status}</p>
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

            <button onClick={addIssue} style={styles.btn}>
              Add Issue
            </button>
          </div>
        )}

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {report.issues?.map((i) => (
              <tr key={i._id}>
                <td>{i.equipment}</td>
                <td>
  <span style={getStatusStyle(i.status)}>
    {i.status}
  </span>

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
        <button
          onClick={() => updateIssueStatus(i._id, "closed")}
          style={styles.smallBtn}
        >
          Close
        </button>
      )}
    </div>
  )}
</td>
                <td>{i.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PARAMETERS */}
      <div style={styles.card}>
        <h3>Shift Parameters</h3>

        {parameters.map((p) => (
          <div key={p._id} style={styles.parameterRow}>
            <b>{p.name}</b>

            <input
              placeholder="Unit 1"
              disabled={isLocked}
              onChange={(e) =>
                handleChange(p._id, "unit1", e.target.value)
              }
            />

            <input
              placeholder="Unit 2"
              disabled={isLocked}
              onChange={(e) =>
                handleChange(p._id, "unit2", e.target.value)
              }
            />

            {!isLocked && (
              <button onClick={() => saveParameter(p._id)}>
                Save
              </button>
            )}
          </div>
        ))}
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

const styles = {
  container: { padding: 40 },
  card: { background: "#fff", padding: 20, marginBottom: 20 },
  inputRow: { display: "flex", gap: 10 },
  input: { flex: 1, padding: 8 },
  btn: { padding: "8px 12px", background: "#1976d2", color: "#fff" },
  table: { width: "100%" },
  parameterRow: { display: "flex", gap: 10, marginBottom: 10 },
  smallBtn: {
  padding: "4px 8px",
  fontSize: "12px",
  border: "none",
  borderRadius: "4px",
  background: "#555",
  color: "#fff",
  cursor: "pointer",
}
};

export default ShiftDetails;