import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
    department: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/auth/register", form);

      alert("Registration successful");

      navigate("/login");

    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");

      if (err.response?.data?.message === "User already exists") {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>E-Logbook Register</h2>

        <form onSubmit={handleRegister} style={styles.form}>
          
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            type="text"
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            style={styles.input}
          >
            <option value="operator">Operator</option>
            <option value="shift_incharge">Shift Incharge</option>
            <option value="hod">HOD</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* NAVIGATION LINK */}
        <p style={{ marginTop: "15px" }}>
          Already registered?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/")}
          >
            Login here
          </span>
        </p>

      </div>
    </div>
  );
}

/* SAME STYLE AS LOGIN */

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    width: "350px",
    textAlign: "center",
  },

  title: {
    marginBottom: "25px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },

  button: {
    padding: "12px",
    borderRadius: "6px",
    border: "none",
    background: "#1976d2",
    color: "#fff",
    fontSize: "15px",
    cursor: "pointer",
  },

  link: {
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Register;