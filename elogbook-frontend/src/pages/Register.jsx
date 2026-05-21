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
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      setLoading(true);

      await api.post("/auth/register", form);

      navigate("/");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed";
      setErrorMsg(message);

      if (message === "User already exists") {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgShape1} />
      <div style={styles.bgShape2} />

      <div style={styles.container}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBadge}>E-Logbook</div>
          <h1 style={styles.heading}>Create your industrial operations account</h1>
          <p style={styles.subText}>
            Join the shift logbook platform to manage operations, parameters, issues, analytics, and AI-powered insights.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>Role-based access control</div>
            <div style={styles.featureItem}>Shift and event tracking</div>
            <div style={styles.featureItem}>Analytics and anomaly detection</div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.caption}>Register to continue</p>

          {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

          <form onSubmit={handleRegister} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingRight: 92 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={styles.showBtn}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Department</label>
              <input
                type="text"
                name="department"
                placeholder="Enter department"
                value={form.department}
                onChange={handleChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
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
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <p style={styles.footerText}>
            Already registered?{" "}
            <span style={styles.link} onClick={() => navigate("/")}>
              Login here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  bgShape1: {
    position: "absolute",
    width: "340px",
    height: "340px",
    borderRadius: "50%",
    background: "rgba(59, 130, 246, 0.18)",
    top: "-80px",
    left: "-80px",
    filter: "blur(10px)",
  },
  bgShape2: {
    position: "absolute",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "rgba(16, 185, 129, 0.16)",
    bottom: "-60px",
    right: "-60px",
    filter: "blur(10px)",
  },
  container: {
    width: "100%",
    maxWidth: "1100px",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "28px",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  leftPanel: {
    color: "#fff",
    padding: "24px",
  },
  brandBadge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.15)",
    marginBottom: "18px",
    fontSize: "14px",
    letterSpacing: "0.4px",
  },
  heading: {
    fontSize: "48px",
    lineHeight: 1.1,
    margin: 0,
    maxWidth: "560px",
  },
  subText: {
    marginTop: "18px",
    fontSize: "16px",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.82)",
    maxWidth: "560px",
  },
  featureList: {
    marginTop: "28px",
    display: "grid",
    gap: "12px",
    maxWidth: "520px",
  },
  featureItem: {
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(8px)",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    justifySelf: "end",
    background: "rgba(255,255,255,0.96)",
    borderRadius: "24px",
    padding: "34px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.28)",
    border: "1px solid rgba(255,255,255,0.35)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },
  caption: {
    marginTop: "8px",
    marginBottom: "22px",
    color: "#64748b",
    fontSize: "14px",
  },
  errorBox: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: 600,
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    outline: "none",
    fontSize: "14px",
    background: "#fff",
    transition: "0.2s ease",
    boxSizing: "border-box",
  },
  passwordWrap: {
    position: "relative",
  },
  showBtn: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: "13px",
    padding: "6px 8px",
  },
  button: {
    marginTop: "4px",
    padding: "13px 16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.28)",
  },
  footerText: {
    marginTop: "18px",
    marginBottom: 0,
    textAlign: "center",
    color: "#475569",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: 700,
  },
};

export default Register;