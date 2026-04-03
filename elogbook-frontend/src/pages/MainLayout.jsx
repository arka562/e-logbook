import { NavLink, useNavigate } from "react-router-dom";

const role = localStorage.getItem("role");

function MainLayout({ children }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "10px 12px",
    marginBottom: "6px",
    borderRadius: "6px",
    color: "white",
    textDecoration: "none",
    background: isActive ? "#334155" : "transparent",
  });

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>E-Logbook</h2>

        <nav>
          <NavLink to="/dashboard" style={linkStyle}>
            Dashboard
          </NavLink>

          <NavLink to="/create-shift" style={linkStyle}>
            Create Shift
          </NavLink>

          <NavLink to="/shifts" style={linkStyle}>
            Shift List
          </NavLink>
          <NavLink to="/analytics" style={linkStyle}>
          
  Analytics
</NavLink>
<NavLink to="/parameters" style={linkStyle}>Parameters</NavLink>
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>{children}</div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial",
  },

  sidebar: {
    width: 220,
    background: "#1e293b",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
  },

  logo: {
    marginBottom: 30,
  },

  content: {
    flex: 1,
    background: "#f4f6f8",
    padding: 25,
    overflow: "auto",
  },

  logoutBtn: {
    width: "100%",
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default MainLayout;
