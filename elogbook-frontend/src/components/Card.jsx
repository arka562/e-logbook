function Card({ title, value }) {
  return (
    <div style={styles.card}>
      {/* TOP GLOW */}
      <div style={styles.glow}></div>

      {/* CONTENT */}
      <div style={styles.content}>
        <p style={styles.title}>{title}</p>

        <h2 style={styles.value}>
          {value ?? 0}
        </h2>

        <div style={styles.bottomRow}>
          <span style={styles.badge}>
            Live Data
          </span>

          <div style={styles.dot}></div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    overflow: "hidden",

    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(14px)",

    padding: "26px",
    borderRadius: "24px",

    border: "1px solid rgba(148,163,184,0.18)",

    boxShadow:
      "0 20px 45px rgba(15,23,42,0.08)",

    transition: "0.3s ease",
    cursor: "pointer",

    minHeight: "150px",

    display: "flex",
    alignItems: "center",
  },

  glow: {
    position: "absolute",
    width: "140px",
    height: "140px",

    borderRadius: "50%",

    background:
      "rgba(37,99,235,0.12)",

    top: "-50px",
    right: "-40px",

    filter: "blur(10px)",
  },

  content: {
    position: "relative",
    zIndex: 2,
    width: "100%",
  },

  title: {
    fontSize: "14px",
    fontWeight: "600",

    color: "#64748b",

    marginBottom: "14px",

    letterSpacing: "0.4px",
  },

  value: {
    fontSize: "42px",
    fontWeight: "800",

    color: "#0f172a",

    marginBottom: "18px",

    lineHeight: 1,
  },

  bottomRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    padding: "7px 12px",

    borderRadius: "999px",

    background:
      "linear-gradient(135deg,#dbeafe,#bfdbfe)",

    color: "#1d4ed8",

    fontSize: "12px",
    fontWeight: "700",
  },

  dot: {
    width: "12px",
    height: "12px",

    borderRadius: "50%",

    background: "#22c55e",

    boxShadow:
      "0 0 14px rgba(34,197,94,0.8)",
  },
};

export default Card;