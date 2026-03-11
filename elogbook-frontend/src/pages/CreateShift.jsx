import { useState } from "react";
import api from "../api/axios";

function CreateShift() {
  const [date, setDate] = useState("");
  const [shiftType, setShiftType] = useState("A");
  const [plant, setPlant] = useState("");
  const [unit, setUnit] = useState("");
  const [engineerName, setEngineerName] = useState("");
  const [engineerRole, setEngineerRole] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/shifts", {
        date,
        shiftType,
        plant,
        unit,
        engineers: [
          {
            name: engineerName,
            role: engineerRole,
          },
        ],
      });

      alert("Shift Created Successfully");

      setDate("");
      setShiftType("A");
      setPlant("");
      setUnit("");
      setEngineerName("");
      setEngineerRole("");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Error creating shift");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Shift</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Shift Type</label>
            <select
              value={shiftType}
              onChange={(e) => setShiftType(e.target.value)}
              style={styles.input}
            >
              <option value="A">Shift A</option>
              <option value="B">Shift B</option>
              <option value="C">Shift C</option>
            </select>
          </div>

          <div style={styles.field}>
            <label>Plant ID</label>
            <input
              placeholder="Enter Plant ID"
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Unit ID</label>
            <input
              placeholder="Enter Unit ID"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Engineer Name</label>
            <input
              placeholder="Enter Engineer Name"
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label>Engineer Role</label>
            <input
              placeholder="Shift Engineer / Operator"
              value={engineerRole}
              onChange={(e) => setEngineerRole(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <button type="submit" style={styles.button}>
            Create Shift
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "420px",
  },

  title: {
    marginBottom: "25px",
    textAlign: "center",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    marginTop: "5px",
    fontSize: "14px",
  },

  button: {
    marginTop: "10px",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    background: "#1976d2",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default CreateShift;
