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
  const [creating, setCreating] = useState(false);

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

  // ================= CREATE PARAMETER =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !category || !plant) {
      alert("Please fill required fields");
      return;
    }

    try {
      setCreating(true);

      await api.post("/parameters/templates", {
        name,
        category,
        unit,
        designValue,
        plant,
      });

      alert("Parameter created successfully");

      setName("");
      setUnit("");
      setDesignValue("");

      fetchTemplates();

    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Error creating parameter"
      );
    } finally {
      setCreating(false);
    }
  };

  // ================= CATEGORY LABEL =================
  const getCategoryLabel = (cat) => {
    switch (cat) {
      case "shift_parameters":
        return "Shift Parameters";

      case "electrical":
        return "Electrical";

      case "switchyard":
        return "Switchyard";

      case "fire_system":
        return "Fire System";

      case "equipment_status":
        return "Equipment Status";

      default:
        return cat;
    }
  };

  // ================= UI =================
  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <div style={styles.bottomGlow} />

      <div style={styles.container}>
        {/* LEFT INFO PANEL */}
        <div style={styles.leftPanel}>
          <div style={styles.badge}>
            Parameter Management
          </div>

          <h1 style={styles.heading}>
            Configure industrial monitoring parameters dynamically
          </h1>

          <p style={styles.subText}>
            Manage parameter templates, assign plant-wise categories,
            configure design values, and maintain scalable monitoring systems.
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>
                Dynamic Parameters
              </h4>

              <p style={styles.featureText}>
                Add new industrial parameters without modifying code.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>
                Plant-wise Configuration
              </h4>

              <p style={styles.featureText}>
                Configure separate parameter templates for every plant.
              </p>
            </div>

            <div style={styles.featureCard}>
              <h4 style={styles.featureTitle}>
                AI-ready Data
              </h4>

              <p style={styles.featureText}>
                Design values help analytics and anomaly detection modules.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div style={styles.rightPanel}>
          {/* CREATE CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                Create Parameter
              </h2>

              <p style={styles.cardSubtitle}>
                Add new operational parameter templates
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={styles.form}
            >
              {/* PLANT */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Select Plant
                </label>

                <select
                  value={plant}
                  onChange={(e) => setPlant(e.target.value)}
                  style={styles.input}
                  required
                >
                  <option value="">
                    Select Plant
                  </option>

                  {plants.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CATEGORY */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={styles.input}
                  disabled={!plant}
                >
                  <option value="shift_parameters">
                    Shift Parameters
                  </option>

                  <option value="electrical">
                    Electrical
                  </option>

                  <option value="switchyard">
                    Switchyard
                  </option>

                  <option value="fire_system">
                    Fire System
                  </option>

                  <option value="equipment_status">
                    Equipment Status
                  </option>
                </select>
              </div>

              {/* PARAMETER NAME */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Parameter Name
                </label>

                <input
                  placeholder="Example: Boiler Pressure"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              {/* UNIT */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Unit
                </label>

                <input
                  placeholder="Example: MW, °C, kg/cm²"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  style={styles.input}
                />
              </div>

              {/* DESIGN VALUE */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Design Value
                </label>

                <input
                  placeholder="Example: 540"
                  type="number"
                  value={designValue}
                  onChange={(e) =>
                    setDesignValue(e.target.value)
                  }
                  style={styles.input}
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                style={styles.btn}
                disabled={creating}
              >
                {creating
                  ? "Creating..."
                  : "Create Parameter"}
              </button>
            </form>
          </div>

          {/* LIST CARD */}
          <div style={styles.card}>
            <div style={styles.tableHeader}>
              <div>
                <h2 style={styles.cardTitle}>
                  Existing Parameters
                </h2>

                <p style={styles.cardSubtitle}>
                  Plant-wise configured parameter templates
                </p>
              </div>

              {plant && (
                <div style={styles.activeFilter}>
                  {
                    plants.find((p) => p._id === plant)
                      ?.name
                  }
                </div>
              )}
            </div>

            {loading ? (
              <div style={styles.loaderWrap}>
                <div style={styles.loader}></div>
                <p>Loading parameters...</p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Design</th>
                      <th>Plant</th>
                    </tr>
                  </thead>

                  <tbody>
                    {templates.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          style={styles.emptyState}
                        >
                          No parameters found
                        </td>
                      </tr>
                    ) : (
                      templates.map((t) => (
                        <tr key={t._id}>
                          <td style={styles.boldText}>
                            {t.name}
                          </td>

                          <td>
                            <span style={styles.categoryBadge}>
                              {getCategoryLabel(
                                t.category
                              )}
                            </span>
                          </td>

                          <td>{t.unit || "-"}</td>

                          <td>
                            {t.designValue || "-"}
                          </td>

                          <td>
                            {t.plant?.name || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
    fontFamily: "Inter, Arial, sans-serif",
    padding: "40px",
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
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: "40px",
    position: "relative",
    zIndex: 2,
  },

  leftPanel: {
    paddingTop: "20px",
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

  rightPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px)",
    borderRadius: "28px",
    padding: "30px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },

  cardHeader: {
    marginBottom: "24px",
  },

  cardTitle: {
    fontSize: "28px",
    color: "#0f172a",
    marginBottom: "6px",
  },

  cardSubtitle: {
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
  },

  btn: {
    marginTop: "10px",
    padding: "14px",
    border: "none",
    borderRadius: "14px",
    background:
      "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow:
      "0 12px 24px rgba(37,99,235,0.22)",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
    gap: "20px",
  },

  activeFilter: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "700",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  categoryBadge: {
    background: "#e0f2fe",
    color: "#0369a1",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700",
  },

  boldText: {
    fontWeight: "700",
    color: "#0f172a",
  },

  emptyState: {
    textAlign: "center",
    padding: "30px",
    color: "#64748b",
  },

  loaderWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
    padding: "30px",
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
};

export default ParameterTemplate;