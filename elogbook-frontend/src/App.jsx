import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateShift from "./pages/CreateShift.jsx";
import ShiftList from "./pages/ShiftLists.jsx";
import ShiftDetails from "./pages/ShiftDetails.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainLayout from "./pages/MainLayout.jsx";
import ReportView from "./pages/ReportView.jsx";
import Analytics from "./pages/Analytics.jsx";
import ParameterTemplate from "./pages/ParameterTemplate.jsx";
import AnomalyView from "./pages/AnomalyView.jsx";
import AuditLog from "./pages/AuditLog.jsx";
import DateRangeReport from "./pages/DateRangeReport.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-shift"
          element={
            <ProtectedRoute roles={["admin", "shift_incharge", "operator"]}>
              <MainLayout>
                <CreateShift />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shifts"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ShiftList />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shifts/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ShiftDetails />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReportView />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Analytics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/parameters"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ParameterTemplate />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ml/anomaly"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AnomalyView />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/audit"
          element={
            <ProtectedRoute roles={["admin", "hod"]}>
              <MainLayout>
                <AuditLog />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/range"
          element={
            <ProtectedRoute roles={["admin", "hod", "shift_incharge"]}>
              <MainLayout>
                <DateRangeReport />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
