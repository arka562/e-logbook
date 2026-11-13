import { Navigate } from "react-router-dom";

// `roles` is the prop App.jsx passes (e.g. roles={["admin", "hod"]}).
// This component previously destructured a differently-named prop that
// no call site ever passed — so every role restriction was silently
// ignored and only the login (token) check actually ran.
// Note: this is UX only. The backend roleAuthorization middleware is
// the real security boundary, and it already enforces these same roles.
function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
