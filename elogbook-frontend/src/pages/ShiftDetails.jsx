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

  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/shift/${id}`);
      const data = res.data.data;

      setReport(data);

      fetchParameters(data.shift.plant._id);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchParameters = async (plantId) => {
    try {
      const res = await api.get(
        `/parameters/templates?category=shift_parameters&plant=${plantId}`,
      );

      setParameters(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const handleChange = (paramId, field, value) => {
    setValues({
      ...values,
      [paramId]: {
        ...values[paramId],
        [field]: value,
      },
    });
  };

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
      console.log(error);
    }
  };

  const addEvent = async () => {
    if (!eventText.trim()) return;

    try {
      await api.post("/events", {
        shiftId: id,
        unitId: report.shift.unit._id,
        description: eventText,
      });

      setEventText("");
      fetchReport();
    } catch (error) {
      console.log(error);
    }
  };

  const addIssue = async () => {
    if (!issueText.trim()) return;

    try {
      await api.post("/issues", {
        shiftId: id,
        unitId: report.shift.unit._id,
        equipment: "Equipment",
        description: issueText,
      });

      setIssueText("");
      fetchReport();
    } catch (error) {
      console.log(error);
    }
  };

  if (!report) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <h2>Shift Logbook</h2>

      {/* SHIFT INFO */}
      <div style={styles.card}>
        <p>
          <b>Plant:</b> {report.shift.plant.name}
        </p>
        <p>
          <b>Unit:</b> {report.shift.unit.name}
        </p>
        <p>
          <b>Shift:</b> {report.shift.shiftType}
        </p>
      </div>

      {/* EVENTS */}
      <div style={styles.card}>
        <h3>Events</h3>

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

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {report.events.map((e) => (
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

        <div style={styles.inputRow}>
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

        <table style={styles.table}>
          <thead>
            <tr>
              <th>Equipment</th>
              <th>Status</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {report.issues.map((i) => (
              <tr key={i._id}>
                <td>{i.equipment}</td>
                <td>
                  <span style={getStatusStyle(i.status)}>{i.status}</span>
                </td>
                <td>{i.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SHIFT PARAMETERS */}
      <div style={styles.card}>
        <h3>Shift Parameters</h3>

        {parameters.map((p) => (
          <div key={p._id} style={styles.parameterRow}>
            <b>{p.name}</b>

            <input
              placeholder="Unit 1"
              onChange={(e) => handleChange(p._id, "unit1", e.target.value)}
            />

            <input
              placeholder="Unit 2"
              onChange={(e) => handleChange(p._id, "unit2", e.target.value)}
            />

            <button onClick={() => saveParameter(p._id)}>Save</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const getStatusStyle = (status) => {
  if (status === "OPEN")
    return {
      background: "#ffebee",
      color: "#c62828",
      padding: "4px 8px",
      borderRadius: "5px",
    };

  if (status === "WIP")
    return {
      background: "#fff3e0",
      color: "#ef6c00",
      padding: "4px 8px",
      borderRadius: "5px",
    };

  if (status === "CLOSED")
    return {
      background: "#e8f5e9",
      color: "#2e7d32",
      padding: "4px 8px",
      borderRadius: "5px",
    };

  return {};
};

const styles = {
  container: {
    padding: 40,
    background: "#f4f6f8",
    minHeight: "100vh",
  },

  card: {
    background: "#fff",
    padding: 20,
    marginBottom: 25,
    borderRadius: 8,
    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    padding: 8,
  },

  btn: {
    padding: "8px 14px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 5,
  },

  parameterRow: {
    display: "flex",
    gap: 10,
    marginBottom: 10,
    alignItems: "center",
  },
};

export default ShiftDetails;
