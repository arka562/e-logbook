import { useEffect, useState } from "react";
import api from "../api/axios";

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: "",
    module: "",
    userRole: "",
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLogs = async () => {
      try {
        setLoading(true);

        const res = await api.get("/audit", {
          params: {
            ...filters,
            limit: 100,
          },
        });

        if (isMounted) {
          setLogs(res.data?.data || []);
        }
      } catch (error) {
        console.error("Audit fetch error:", error);

        if (isMounted) {
          setLogs([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLogs();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      action: "",
      module: "",
      userRole: "",
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Audit Trail</div>
          <h1 style={styles.title}>System Activity Log</h1>
          <p style={styles.subtitle}>
            Review user actions, workflow approvals, and operational changes.
          </p>
        </div>
      </div>

      <div style={styles.filterBar}>
        <select
          value={filters.action}
          onChange={(e) => updateFilter("action", e.target.value)}
          style={styles.input}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="SUBMIT">Submit</option>
          <option value="APPROVE">Approve</option>
          <option value="LOCK">Lock</option>
          <option value="UPDATE_HANDOVER">Update Handover</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>

        <select
          value={filters.module}
          onChange={(e) => updateFilter("module", e.target.value)}
          style={styles.input}
        >
          <option value="">All Modules</option>
          <option value="SHIFT">Shift</option>
          <option value="ISSUE">Issue</option>
          <option value="EVENT">Event</option>
          <option value="USER">User</option>
          <option value="PARAMETER">Parameter</option>
        </select>

        <select
          value={filters.userRole}
          onChange={(e) => updateFilter("userRole", e.target.value)}
          style={styles.input}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="hod">HOD</option>
          <option value="shift_incharge">Shift Incharge</option>
          <option value="operator">Operator</option>
        </select>

        <button onClick={resetFilters} style={styles.resetBtn}>
          Reset
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Recent Activity</h2>
          <span style={styles.countChip}>{logs.length} logs</span>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading audit logs...</div>
        ) : logs.length === 0 ? (
          <div style={styles.emptyState}>No audit logs found</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.th}>Module</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Description</th>
                  <th style={styles.th}>IP</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={styles.td}>
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td style={styles.td}>
                      <span style={styles.actionBadge}>{log.action}</span>
                    </td>
                    <td style={styles.td}>{log.module || "-"}</td>
                    <td style={styles.tdBold}>{log.user?.name || "System"}</td>
                    <td style={styles.td}>{log.userRole || log.user?.role || "-"}</td>
                    <td style={styles.td}>{log.description || "-"}</td>
                    <td style={styles.td}>{log.ipAddress || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "36px",
    background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 55%, #e2e8f0 100%)",
    fontFamily: "Inter, Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "24px",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "13px",
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "40px",
  },
  subtitle: {
    marginTop: "10px",
    marginBottom: 0,
    color: "#475569",
    lineHeight: 1.7,
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
  },
  resetBtn: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#334155",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  card: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
  },
  countChip: {
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
  },
  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "12px 10px",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    color: "#334155",
    fontSize: "14px",
  },
  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#475569",
    verticalAlign: "top",
  },
  tdBold: {
    padding: "12px 10px",
    borderBottom: "1px solid #f1f5f9",
    color: "#0f172a",
    fontWeight: 700,
    verticalAlign: "top",
  },
  actionBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e0f2fe",
    color: "#0369a1",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  emptyState: {
    padding: "32px",
    borderRadius: "16px",
    background: "#f8fafc",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },
};

export default AuditLog;
