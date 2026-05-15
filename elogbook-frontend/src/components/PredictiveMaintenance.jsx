import { useEffect, useState } from "react";
import api from "../api/axios";

function PredictiveMaintenance() {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {

      const res = await api.get(
        "/ml/predictive-maintenance"
      );

      setData(res.data.data || []);

    } catch (error) {
      console.log(error);
      setData([]);
    }
  };

  const getColor = (risk) => {

    if (risk === "High") return "#dc2626";
    if (risk === "Medium") return "#f59e0b";

    return "#16a34a";
  };

  return (

    <div style={styles.card}>

      <h3>Predictive Maintenance</h3>

      <table style={styles.table}>

        <thead>
          <tr>
            <th>Equipment</th>
            <th>Issue Count</th>
            <th>Risk</th>
          </tr>
        </thead>

        <tbody>

          {data.length === 0 ? (

            <tr>
              <td colSpan="3">
                No maintenance predictions available
              </td>
            </tr>

          ) : (

            data.map((d, i) => (

              <tr key={i}>

                <td>{d.equipment}</td>

                <td>{d.issueCount}</td>

                <td
                  style={{
                    color: getColor(d.risk),
                    fontWeight: "bold"
                  }}
                >
                  {d.risk}
                </td>

              </tr>
            ))

          )}

        </tbody>

      </table>

    </div>
  );
}

const styles = {
  card: {
    background: "white",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
};

export default PredictiveMaintenance;