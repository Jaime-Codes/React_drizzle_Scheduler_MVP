import { NavLink } from "react-router";
import { useAuth } from "../hooks/auth";

import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user } = useAuth();
  console.log("this is the user", user);
  const dashboardName =
    user && user.role === "caregiver" ? "caregiver" : "client";
  return (
    <nav className={styles.container}>
      <div className={styles.linkContainer}>
        <NavLink className={styles.link} to='/' end>
          Home
        </NavLink>
        <NavLink className={styles.link} to={`${dashboardName}/dashboard`} end>
          Dashboard
        </NavLink>
      </div>
      <div className={styles.linkContainer}>
        {user === null && (
          <NavLink className={styles.link} to='/login' end>
            Login
          </NavLink>
        )}
        {user && (
          <NavLink className={styles.link} to='/logout'>
            Logout
          </NavLink>
        )}
        {user === null && (
          <NavLink className={styles.link} to='/register'>
            Register
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
