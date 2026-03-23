import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateShift from "./pages/CreateShift.jsx";
import ShiftList from "./pages/ShiftLists.jsx";
import ShiftDetails from "./pages/ShiftDetails";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import MainLayout from "./pages/MainLayout.jsx";
import ReportView from "./pages/ReportView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes */}
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
        <ReportView/>
      </MainLayout>
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
