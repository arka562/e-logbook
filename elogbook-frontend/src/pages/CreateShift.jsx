import { useState, useEffect } from "react";
import api from "../api/axios";

function CreateShift() {
  const [date, setDate] = useState("");
  const [shiftType, setShiftType] = useState("A");

  const [plant, setPlant] = useState("");
  const [unit, setUnit] = useState("");

  const [plants, setPlants] = useState([]);
  const [units, setUnits] = useState([]);

  const [engineerName, setEngineerName] = useState("");
  const [engineerRole, setEngineerRole] = useState("");

  // ================= FETCH PLANTS & UNITS =================
  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const plantRes = await api.get("/admin/plants");
      const unitRes = await api.get("/admin/units");
      console.log("Plants:", plantRes.data);
      setPlants(plantRes.data.data || []);
      setUnits(unitRes.data.data || []);
    } catch (err) {
      console.log("Error fetching plants/units:", err);
    }
  };

  // ================= FILTER UNITS BY PLANT =================
  const filteredUnits = units.filter((u) =>
    plant ? u.plant === plant : true
  );

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const engineersData =
      engineerName && engineerRole
        ? [{ name: engineerName, role: engineerRole }]
        : [];
console.log({
  date,
  shiftType,
  plant,
  unit
});
    try {
      const res = await api.post("/shifts", {
        date: new Date(date).toISOString(),
        shiftType,
        plant,
        unit,
        engineers: engineersData,
      });
    
      if (res.data.success) {
        alert("Shift Created Successfully");

        // reset form
        setDate("");
        setShiftType("A");
        setPlant("");
        setUnit("");
        setEngineerName("");
        setEngineerRole("");
      }

    } catch (error) {
      console.log(error);

      alert(
        error?.response?.data?.message ||
        "Something went wrong. Try again."
      );
    }
  };

  // ================= UI =================
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Shift</h2>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* DATE */}
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

          {/* SHIFT TYPE */}
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

          {/* PLANT */}
          <div style={styles.field}>
            <label>Plant</label>
            <select
              value={plant}
              onChange={(e) => {
                setPlant(e.target.value);
                setUnit(""); // reset unit on plant change
              }}
              style={styles.input}
              required
            >
              <option value="">Select Plant</option>
              {plants.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* UNIT */}
          <div style={styles.field}>
            <label>Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              style={styles.input}
              required
            >
              <option value="">Select Unit</option>
              {filteredUnits.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* ENGINEER NAME */}
          <div style={styles.field}>
            <label>Engineer Name</label>
            <input
              placeholder="Enter Engineer Name"
              value={engineerName}
              onChange={(e) => setEngineerName(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* ENGINEER ROLE */}
          <div style={styles.field}>
            <label>Engineer Role</label>
            <input
              placeholder="Shift Engineer / Operator"
              value={engineerRole}
              onChange={(e) => setEngineerRole(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* BUTTON */}
          <button type="submit" style={styles.button}>
            Create Shift
          </button>

        </form>
      </div>
    </div>
  );
}

// ================= STYLES =================
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