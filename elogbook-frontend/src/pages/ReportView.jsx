import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function ReportView() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await api.get(`/reports/shift/${id}`);
        setReport(res.data.data || null);
      } catch (error) {
        console.log(error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);

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
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div style={styles.page}>
        <div style={styles.emptyCard}>No report found</div>
      </div>
    );
  }

  const shift = report.shift || {};
  const parameters = report.parameters || [];
  const events = report.events || [];
  const issues = report.issues || [];

  return (
    <div style={styles.page}>
      <div style={styles.topGlow} />
      <div style={styles.bottomGlow} />

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <div style={styles.badge}>Shift Report</div>
            <h1 style={styles.title}>Operational Summary</h1>
            <p style={styles.subtitle}>
              Review parameters, events, and issues for the selected shift.
            </p>
          </div>

          <button
            style={styles.pdfBtn}
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? "Downloading..." : "Download PDF"}
          </button>
        </div>

        {/* SHIFT INFO */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Shift Information</h2>
            <span style={styles.statusChip}>
              {shift?.status ? shift.status.toUpperCase() : "N/A"}
            </span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Plant</span>
              <span style={styles.infoValue}>{shift?.plant?.name || "N/A"}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Unit</span>
              <span style={styles.infoValue}>{shift?.unit?.name || "N/A"}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Shift Type</span>
              <span style={styles.infoValue}>{shift?.shiftType || "N/A"}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Date</span>
              <span style={styles.infoValue}>
                {shift?.date ? new Date(shift.date).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.grid}>
          {/* PARAMETERS */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Parameters</h2>
              <span style={styles.countChip}>{parameters.length} entries</span>
            </div>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={th}>Parameter</th>
                    <th style={th}>Unit 1</th>
                    <th style={th}>Unit 2</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={tdEmpty}>
                        No parameters recorded
                      </td>
                    </tr>
                  ) : (
                    parameters.map((p) => (
                      <tr key={p._id}>
                        <td style={tdBold}>{p.parameter?.name || "N/A"}</td>
                        <td style={td}>{p.unit1Value || "-"}</td>
                        <td style={td}>{p.unit2Value || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* EVENTS */}
          <div style={styles.card}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Events</h2>
              <span style={styles.countChip}>{events.length} logs</span>
            </div>

            <div style={styles.listWrap}>
              {events.length === 0 ? (
                <div style={styles.emptyState}>No events recorded</div>
              ) : (
                events.map((e) => (
                  <div key={e._id} style={styles.listItem}>
                    <div style={styles.listTopRow}>
                      <span style={styles.listTime}>
                        {e.createdAt
                          ? new Date(e.createdAt).toLocaleTimeString()
                          : "-"}
                      </span>
                    </div>
                    <div style={styles.listText}>{e.description}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ISSUES */}
        <div style={styles.card}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Issues</h2>
            <span style={styles.countChip}>{issues.length} issues</span>
          </div>

          <div style={styles.listWrap}>
            {issues.length === 0 ? (
              <div style={styles.emptyState}>No issues reported</div>
            ) : (
              issues.map((i) => (
                <div key={i._id} style={styles.issueItem}>
                  <div style={styles.issueTop}>
                    <div>
                      <div style={styles.issueEquipment}>
                        {i.equipment || "Equipment"}
                      </div>
                      <div style={styles.issueDesc}>{i.description}</div>
                    </div>

                    <span
                      style={{
                        ...styles.statusPill,
                        background:
                          i.status === "closed"
                            ? "#dcfce7"
                            : i.status === "wip"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          i.status === "closed"
                            ? "#166534"
                            : i.status === "wip"
                            ? "#92400e"
                            : "#b91c1c",
                      }}
                    >
                      {i.status || "open"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e2e8f0 100%)",
    position: "relative",
    overflow: "hidden",
    padding: "36px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  topGlow: {
    position: "absolute",
    width: "380px",
    height: "380px",
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
    maxWidth: "1400px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(37,99,235,0.12)",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    fontSize: "40px",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "15px",
    maxWidth: "720px",
    lineHeight: 1.7,
  },
  pdfBtn: {
    padding: "12px 18px",
    background: "linear-gradient(135deg, #16a34a, #15803d)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "0 10px 22px rgba(22, 163, 74, 0.18)",
  },
  card: {
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(14px)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "24px",
    color: "#0f172a",
  },
  statusChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: 700,
  },
  countChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  infoItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px 16px",
  },
  infoLabel: {
    display: "block",
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "6px",
  },
  infoValue: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0f172a",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "24px",
    marginBottom: "24px",
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  listWrap: {
    display: "grid",
    gap: "12px",
  },
  listItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px 16px",
  },
  listTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  listTime: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 700,
  },
  listText: {
    color: "#0f172a",
    lineHeight: 1.6,
  },
  issueItem: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "12px",
  },
  issueTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  issueEquipment: {
    fontSize: "16px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "6px",
  },
  issueDesc: {
    color: "#475569",
    lineHeight: 1.6,
  },
  statusPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  loadingCard: {
    maxWidth: "420px",
    margin: "100px auto",
    padding: "28px",
    background: "#fff",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(15,23,42,0.08)",
  },
  emptyCard: {
    maxWidth: "420px",
    margin: "100px auto",
    padding: "28px",
    background: "#fff",
    borderRadius: "20px",
    textAlign: "center",
    boxShadow: "0 15px 35px rgba(15,23,42,0.08)",
    color: "#475569",
  },
  emptyState: {
    padding: "18px",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#334155",
  },
  tdBold: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#0f172a",
    fontWeight: 700,
  },
  tdEmpty: {
    padding: "18px",
    textAlign: "center",
    color: "#64748b",
  },
};

const th = {
  padding: "12px 10px",
  borderBottom: "1px solid #e2e8f0",
  textAlign: "left",
  color: "#334155",
  fontSize: "14px",
};

export default ReportView;