import { useAuth } from "../hooks/auth";
import styles from "./Navbar.module.css";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router";
const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("this is the user", user);
  const dashboardName =
    user && user.role === "caregiver" ? "caregiver" : "client";
  return (
    <nav className={styles.container}>
      <div className={styles.linkContainer}>
        <Button size='md' color='blue' onClick={() => navigate("/")}>
          Home
        </Button>
        <Button
          size='md'
          color='blue'
          onClick={() => navigate(`${dashboardName}/dashboard`)}
        >
          Dashboard
        </Button>
      </div>
      <div className={styles.linkContainer}>
        {user === null && (
          <Button
            className={styles.link}
            size='md'
            color='blue'
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        )}
        {user && (
          <Button
            className={styles.link}
            size='md'
            color='blue'
            onClick={() => navigate("/Logout")}
          >
            Logout
          </Button>
        )}
        {user === null && (
          <Button
            className={styles.link}
            size='md'
            color='blue'
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
