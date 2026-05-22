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

  const [loading, setLoading] = useState(false);

  // ================= FETCH PLANTS & UNITS =================
  useEffect(() => {
    fetchMeta();
  }, []);

  const fetchMeta = async () => {
    try {
      const plantRes = await api.get("/admin/plants");
      const unitRes = await api.get("/admin/units");

      setPlants(plantRes.data.data || []);
      setUnits(unitRes.data.data || []);
    } catch (err) {
      console.log("Error fetching plants/units:", err);
    }
  };

  // ================= FILTER UNITS =================
  const filteredUnits = units.filter((u) =>
    plant ? u.plant === plant || u.plant?._id === plant : true
  );

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const engineersData =
      engineerName && engineerRole
        ? [{ name: engineerName, role: engineerRole }]
        : [];

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
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <div style={styles.bottomGlow} />

      <div style={styles.container}>
        {/* LEFT PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.badge}>Shift Operations</div>

          <h1 style={styles.heading}>
            Create and manage industrial shifts seamlessly
          </h1>

          <p style={styles.subText}>
            Configure plant operations, assign units, add engineers, and
            maintain accurate shift records from one centralized system.
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>Plant-wise Control</h4>
              <p style={styles.featureText}>
                Create shifts for multiple plants and units dynamically.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>Engineer Assignment</h4>
              <p style={styles.featureText}>
                Assign operators and shift engineers efficiently.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>Real-time Tracking</h4>
              <p style={styles.featureText}>
                Monitor industrial activities and operations continuously.
              </p>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.title}>Create New Shift</h2>
            <p style={styles.caption}>
              Fill all operational details carefully
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* DATE */}
            <div style={styles.field}>
              <label style={styles.label}>Date</label>

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
              <label style={styles.label}>Shift Type</label>

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
              <label style={styles.label}>Plant</label>

              <select
                value={plant}
                onChange={(e) => {
                  setPlant(e.target.value);
                  setUnit("");
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
              <label style={styles.label}>Unit</label>

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
              <label style={styles.label}>Engineer Name</label>

              <input
                placeholder="Enter engineer name"
                value={engineerName}
                onChange={(e) => setEngineerName(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* ENGINEER ROLE */}
            <div style={styles.field}>
              <label style={styles.label}>Engineer Role</label>

              <input
                placeholder="Shift Engineer / Operator"
                value={engineerRole}
                onChange={(e) => setEngineerRole(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              style={styles.button}
              disabled={loading}
            >
              {loading ? "Creating Shift..." : "Create Shift"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial, sans-serif",
    padding: "40px",
  },

  topGlow: {
    position: "absolute",
    width: "350px",
    height: "350px",
    borderRadius: "50%",
    background: "rgba(37,99,235,0.12)",
    top: "-120px",
    right: "-120px",
    filter: "blur(20px)",
  },

  bottomGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "rgba(16,185,129,0.10)",
    bottom: "-100px",
    left: "-100px",
    filter: "blur(20px)",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 480px",
    gap: "40px",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },

  leftPanel: {
    paddingRight: "20px",
  },

  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.12)",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "13px",
    marginBottom: "20px",
  },

  heading: {
    fontSize: "52px",
    lineHeight: 1.1,
    color: "#0f172a",
    marginBottom: "20px",
    maxWidth: "700px",
  },

  subText: {
    fontSize: "17px",
    lineHeight: 1.8,
    color: "#475569",
    maxWidth: "650px",
    marginBottom: "35px",
  },

  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
    marginTop: "20px",
  },

  featureCard: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 15px 30px rgba(15,23,42,0.06)",
  },

  featureTitle: {
    marginBottom: "10px",
    color: "#0f172a",
    fontSize: "18px",
  },

  featureText: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "35px",
    border: "1px solid rgba(148,163,184,0.2)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },

  cardHeader: {
    marginBottom: "24px",
  },

  title: {
    fontSize: "30px",
    color: "#0f172a",
    marginBottom: "8px",
  },

  caption: {
    color: "#64748b",
    fontSize: "14px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
    transition: "0.2s ease",
  },

  button: {
    marginTop: "10px",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 12px 24px rgba(37,99,235,0.22)",
  },
};

export default CreateShift;