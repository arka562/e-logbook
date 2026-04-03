import { useEffect, useState } from "react";
import api from "../api/axios";

function ParameterTemplate() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("shift_parameters");
  const [unit, setUnit] = useState("");
  const [designValue, setDesignValue] = useState("");
  const [plant, setPlant] = useState("");

  const [plants, setPlants] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH PLANTS =================
  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      const res = await api.get("/admin/plants");
      setPlants(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= FETCH TEMPLATES =================
  const fetchTemplates = async () => {
    if (!plant || !category) return;

    try {
      setLoading(true);

      const res = await api.get("/parameters/templates", {
        params: {
          category,
          plant,
        },
      });

      setTemplates(res.data.data || []);
    } catch (err) {
      console.error("Fetch Templates Error:", err);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (plant && category) {
      fetchTemplates();
    }
  }, [plant, category]);

  // ================= CREATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !plant) {
      alert("Please fill required fields");
      return;
    }

    try {
      await api.post("/parameters/templates", {
        name,
        category,
        unit,
        designValue,
        plant,
      });

      alert("Parameter created");

      setName("");
      setUnit("");
      setDesignValue("");

      fetchTemplates();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Error creating parameter");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Parameter Template Management</h2>

      {/* CREATE FORM */}
      <div style={styles.card}>
        <h3>Create Parameter</h3>

        <form onSubmit={handleSubmit} style={styles.form}>
          <select
            value={plant}
            onChange={(e) => setPlant(e.target.value)}
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

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.input}
            disabled={!plant}
          >
            <option value="shift_parameters">Shift Parameters</option>
            <option value="electrical">Electrical</option>
            <option value="switchyard">Switchyard</option>
            <option value="fire_system">Fire System</option>
            <option value="equipment_status">Equipment Status</option>
          </select>

          <input
            placeholder="Parameter Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
            required
          />

          <input
            placeholder="Unit (e.g., MW, °C)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            style={styles.input}
          />

          <input
            placeholder="Design Value"
            type="number"
            value={designValue}
            onChange={(e) => setDesignValue(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.btn}>
            Create Parameter
          </button>
        </form>
      </div>

      {/* LIST */}
      <div style={styles.card}>
        <h3>Existing Parameters</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Unit</th>
                <th>Design</th>
                <th>Plant</th>
              </tr>
            </thead>

            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="4">No data found</td>
                </tr>
              ) : (
                templates.map((t) => (
                  <tr key={t._id}>
                    <td>{t.name}</td>
                    <td>{t.unit || "-"}</td>
                    <td>{t.designValue || "-"}</td>
                    <td>{t.plant?.name || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 40 },
  card: {
    background: "#fff",
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  btn: {
    padding: 10,
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    marginTop: 10,
  },
};

export default ParameterTemplate;