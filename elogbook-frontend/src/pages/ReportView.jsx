import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ReportView() {

  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 

    const fetchReport = async () => {

      try {

        const res = await api.get(`/reports/shift/${id}`);

        setReport(res.data.data);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }
    };

    fetchReport();

  }, [id]);

  if (loading) return <p>Loading report...</p>;

  if (!report) return <p>No report found</p>;

  const shift = report.shift;

  return (

    <div style={styles.container}>

      <h2>Shift Report</h2>

      {/* SHIFT INFO */}
      <div style={styles.section}>
        <p><b>Plant:</b> {shift?.plant?.name}</p>
        <p><b>Unit:</b> {shift?.unit?.name}</p>
        <p><b>Shift:</b> {shift?.shiftType}</p>
        <p><b>Date:</b> {new Date(shift?.date).toLocaleDateString()}</p>
      </div>

      {/* PARAMETERS */}
      <h3>Parameters</h3>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={th}>Parameter</th>
            <th style={th}>Unit 1</th>
            <th style={th}>Unit 2</th>
          </tr>
        </thead>

        <tbody>

          {report.parameters.length === 0 ? (
            <tr>
              <td colSpan="3" style={td}>No parameters</td>
            </tr>
          ) : (
            report.parameters.map((p) => (
              <tr key={p._id}>
                <td style={td}>{p.parameter?.name}</td>
                <td style={td}>{p.unit1Value}</td>
                <td style={td}>{p.unit2Value}</td>
              </tr>
            ))
          )}

        </tbody>
      </table>

      {/* EVENTS */}
      <h3>Events</h3>

      {report.events.length === 0 ? (
        <p>No events recorded</p>
      ) : (
        report.events.map((e) => (
          <div key={e._id} style={styles.card}>
            {e.description}
          </div>
        ))
      )}

      {/* ISSUES */}
      <h3>Issues</h3>

      {report.issues.length === 0 ? (
        <p>No issues reported</p>
      ) : (
        report.issues.map((i) => (
          <div key={i._id} style={styles.card}>
            <b>{i.equipment}</b> — {i.status}
          </div>
        ))
      )}

      {/* PDF */}
      <button
        style={styles.btn}
        onClick={async () => {
  try {
    const res = await api.get(`/reports/shift/${id}/pdf`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", `shift_${id}.pdf`);

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (err) {
    console.error(err);
    alert("Failed to download PDF");
  }
}}
        
      >
        Download PDF
      </button>

    </div>
  );
}

/* STYLES */

const styles = {
  container: {
    padding: 40,
    background: "#f4f6f8",
    minHeight: "100vh"
  },

  section: {
    marginBottom: 20
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "white",
    marginBottom: 20
  },

  card: {
    background: "white",
    padding: "10px",
    marginBottom: "8px",
    borderRadius: "6px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
  },

  btn: {
    padding: "10px 18px",
    background: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

const th = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "left"
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};

export default ReportView;