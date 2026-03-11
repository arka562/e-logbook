function Card({ title, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.title}>{title}</p>
      <h2 style={styles.value}>{value ?? 0}</h2>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
    transition: "0.2s",
  },

  title: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "10px",
  },

  value: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#1976d2",
  },
};

export default Card;
