const Card = ({ title, value }) => (
  <div
    style={{
      padding: "15px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      background: "#f9f9f9",
    }}
  >
    <h4>{title}</h4>
    <p style={{ fontSize: "20px", fontWeight: "bold" }}>{value ?? 0}</p>
  </div>
);

export default Card;
