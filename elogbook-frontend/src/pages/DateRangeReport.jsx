import { useEffect, useState } from "react";
import api from "../api/axios";

function DateRangeReport() {
  const today = new Date().toISOString().slice(0, 10);

  const [filters, setFilters] = useState({
    startDate: today,
    endDate: today,
    plant: "",
    unit: "",
    issueStatus: "",
    parameterCategory: "",
  });
  const [plants, setPlants] = useState([]);
  const [units, setUnits] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [plantRes, unitRes] = await Promise.all([
          api.get("/admin/plants"),
          api.get("/admin/units"),
        ]);

        setPlants(plantRes.data?.data || []);
        setUnits(unitRes.data?.data || []);
      } catch (error) {
        console.error("Report filter option fetch error:", error);
      }
    };

    fetchOptions();
  }, []);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
      ...(name === "plant" ? { unit: "" } : {}),
    }));
  };

  const fetchReport = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert("Please select start and end date");
      return;
    }

    try {
      setLoading(true);

      const res = await api.get("/reports/range", {
        params: filters,
      });

      setReport(res.data?.data || null);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to generate report");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const visibleUnits = filters.plant
    ? units.filter((unit) => unit.plant?._id === filters.plant || unit.plant === filters.plant)
    : units;

  const summary = report?.summary || {};
  const shifts = report?.shifts || [];
  const issues = report?.issues || [];
  const events = report?.events || [];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.badge}>Reports</div>
          <h1 style={styles.title}>Date Range Report</h1>
          <p style={styles.subtitle}>
            Generate operational summaries across multiple shifts and units.
          </p>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterGrid}>
          <label style={styles.field}>
            <span style={styles.label}>Start Date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>End Date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Plant</span>
            <select
              value={filters.plant}
              onChange={(e) => updateFilter("plant", e.target.value)}
              style={styles.input}
            >
              <option value="">All Plants</option>
              {plants.map((plant) => (
                <option key={plant._id} value={plant._id}>
                  {plant.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Unit</span>
            <select
              value={filters.unit}
              onChange={(e) => updateFilter("unit", e.target.value)}
              style={styles.input}
            >
              <option value="">All Units</option>
              {visibleUnits.map((unit) => (
                <option key={unit._id} value={unit._id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Issue Status</span>
            <select
              value={filters.issueStatus}
              onChange={(e) => updateFilter("issueStatus", e.target.value)}
              style={styles.input}
            >
              <option value="">All Issues</option>
              <option value="open">Open</option>
              <option value="wip">WIP</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label style={styles.field}>
            <span style={styles.label}>Parameter Category</span>
            <select
              value={filters.parameterCategory}
              onChange={(e) => updateFilter("parameterCategory", e.target.value)}
              style={styles.input}
            >
              <option value="">All Categories</option>
              <option value="shift_parameters">Shift Parameters</option>
              <option value="electrical">Electrical</option>
              <option value="switchyard">Switchyard</option>
              <option value="fire_system">Fire System</option>
              <option value="equipment_status">Equipment Status</option>
            </select>
          </label>
        </div>

        <button onClick={fetchReport} style={styles.primaryBtn} disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {report && (
        <>
          <div style={styles.summaryGrid}>
            <SummaryCard label="Shifts" value={summary.shifts || 0} />
            <SummaryCard label="Parameters" value={summary.parameters || 0} />
            <SummaryCard label="Events" value={summary.events || 0} />
            <SummaryCard label="Issues" value={summary.issues || 0} />
          </div>

          <div style={styles.grid}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Shifts</h2>
                <span style={styles.countChip}>{shifts.length}</span>
              </div>

              <Table
                emptyText="No shifts found"
                columns={["Date", "Shift", "Plant", "Unit", "Status"]}
                rows={shifts.map((shift) => [
                  shift.date ? new Date(shift.date).toLocaleDateString() : "-",
                  shift.shiftType || "-",
                  shift.plant?.name || "-",
                  shift.unit?.name || "-",
                  shift.status || "-",
                ])}
              />
            </section>

            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.cardTitle}>Issues</h2>
                <span style={styles.countChip}>{issues.length}</span>
              </div>

              <Table
                emptyText="No issues found"
                columns={["Equipment", "Priority", "Status", "Department", "Description"]}
                rows={issues.map((issue) => [
                  issue.equipment || "-",
                  issue.priority || "medium",
                  issue.status || "-",
                  issue.department?.name || "-",
                  issue.description || "-",
                ])}
              />
            </section>
          </div>

          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Events</h2>
              <span style={styles.countChip}>{events.length}</span>
            </div>

            <Table
              emptyText="No events found"
              columns={["Time", "Unit", "Created By", "Description"]}
              rows={events.map((event) => [
                event.createdAt ? new Date(event.createdAt).toLocaleString() : "-",
                event.unit?.name || "-",
                event.createdBy?.name || "-",
                event.description || "-",
              ])}
            />
          </section>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div style={styles.summaryCard}>
      <span style={styles.summaryLabel}>{label}</span>
      <strong style={styles.summaryValue}>{value}</strong>
    </div>
  );
}

function Table({ columns, rows, emptyText }) {
  if (rows.length === 0) {
    return <div style={styles.emptyState}>{emptyText}</div>;
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} style={styles.th}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} style={styles.td}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
  filterCard: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "18px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 700,
  },
  input: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
  },
  primaryBtn: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "24px",
  },
  summaryCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  },
  summaryLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "13px",
    marginBottom: "8px",
  },
  summaryValue: {
    color: "#0f172a",
    fontSize: "30px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },
  card: {
    background: "rgba(255,255,255,0.86)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "24px",
    marginBottom: "24px",
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
  emptyState: {
    padding: "24px",
    borderRadius: "16px",
    background: "#f8fafc",
    color: "#64748b",
    border: "1px dashed #cbd5e1",
    textAlign: "center",
  },
};

export default DateRangeReport;
