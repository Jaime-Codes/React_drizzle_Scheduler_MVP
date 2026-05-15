import { NavLink } from "react-router";
import { useAuth } from "../hooks/auth";

const Navbar = () => {
  const { user } = useAuth();
  console.log("this is the user", user);
  const dashboardName =
    user && user.role === "caregiver" ? "caregiver" : "client";
  return (
    <nav>
      <NavLink to='/' end>
        Home
      </NavLink>
      <NavLink to={`${dashboardName}/dashboard`} end>
        Dashboard
      </NavLink>
      {user === null && (
        <NavLink to='/login' end>
          Login
        </NavLink>
      )}
      {user && <NavLink to='/logout'>Logout</NavLink>}
      {user === null && <NavLink to='/register'>Register</NavLink>}
    </nav>
  );
};

export default Navbar;
