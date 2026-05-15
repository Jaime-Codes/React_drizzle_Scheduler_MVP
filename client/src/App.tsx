import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./components/Register";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import { useAuth } from "./hooks/auth";
import CaregiverDashboard from "./components/CaregiverDashboard";
import ClientDashboard from "./components/ClientDashboard";
import { useEffect } from "react";

const Logout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to='/login' replace />;
};

const RegisterAndLogout = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <Register />;
};
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/logout' element={<Logout />} />
        <Route path='/register' element={<RegisterAndLogout />} />

        <Route path='*' element={<NotFound />}></Route>
        <Route
          path='/caregiver/dashboard'
          element={
            <ProtectedRoute allowedRoles={["caregiver"]}>
              <CaregiverDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/client/dashboard'
          element={
            <ProtectedRoute allowedRoles={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
