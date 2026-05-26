import { NavLink, useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "user";
  const name = localStorage.getItem("name") || "User";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/");
  };

  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    marginBottom: "8px",
    borderRadius: "12px",
    color: "#e2e8f0",
    textDecoration: "none",
    background: isActive ? "rgba(59, 130, 246, 0.18)" : "transparent",
    border: isActive ? "1px solid rgba(59, 130, 246, 0.35)" : "1px solid transparent",
    transition: "0.2s ease",
    fontWeight: isActive ? 700 : 500,
  });

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBlock}>
          <div style={styles.logo}>E-Logbook</div>
          <p style={styles.tagline}>Industrial Operations Platform</p>
        </div>

        <div style={styles.userCard}>
          <div style={styles.avatar}>{name.slice(0, 1).toUpperCase()}</div>
          <div>
            <div style={styles.userName}>{name}</div>
            <div style={styles.userRole}>{role}</div>
          </div>
        </div>

        <nav style={styles.nav}>
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/shifts" style={linkStyle}>
            Shift List
          </NavLink>

          <NavLink to="/create-shift" style={linkStyle}>
            Create Shift
          </NavLink>

          <NavLink to="/analytics" style={linkStyle}>
            Analytics
          </NavLink>

          <NavLink to="/parameters" style={linkStyle}>
            Parameters
          </NavLink>

          <NavLink to="/ml/anomaly" style={linkStyle}>
            ML Anomaly
          </NavLink>

          {(role === "admin" || role === "hod") && (
            <NavLink to="/audit" style={linkStyle}>
              Audit Log
            </NavLink>
          )}
        </nav>

        <div style={styles.sidebarFooter}>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.content}>
        <header style={styles.topBar}>
          <div>
            <h2 style={styles.pageTitle}>Operations Dashboard</h2>
            <p style={styles.pageSubtitle}>
              Monitor shifts, events, issues, analytics, and AI insights in one place.
            </p>
          </div>

          <div style={styles.statusChip}>Connected</div>
        </header>

        <section style={styles.pageBody}>{children}</section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "Inter, Arial, sans-serif",
  },
  sidebar: {
    width: 280,
    background:
      "linear-gradient(180deg, #0f172a 0%, #111827 55%, #1e293b 100%)",
    color: "white",
    padding: "22px 18px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "8px 0 24px rgba(15, 23, 42, 0.15)",
  },
  brandBlock: {
    marginBottom: "18px",
    padding: "10px 8px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  logo: {
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "0.5px",
  },
  tagline: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "13px",
    color: "#94a3b8",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "16px",
    padding: "14px",
    marginBottom: "18px",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #14b8a6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    color: "#fff",
    flexShrink: 0,
  },
  userName: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.2,
  },
  userRole: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "capitalize",
    marginTop: "3px",
  },
  nav: {
    flex: 1,
    marginTop: "6px",
  },
  sidebarFooter: {
    marginTop: "auto",
    paddingTop: "18px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  logoutBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(239, 68, 68, 0.22)",
  },
  content: {
    flex: 1,
    padding: "24px",
    overflow: "auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "18px",
    marginBottom: "20px",
    padding: "18px 20px",
    background: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    backdropFilter: "blur(10px)",
  },
  pageTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },
  pageSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  statusChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  pageBody: {
    minHeight: "calc(100vh - 140px)",
  },
};

export default MainLayout;
