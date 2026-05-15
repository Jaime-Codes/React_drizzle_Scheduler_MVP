import { useState } from "react";
import api from "../api";
import LoadingIndicator from "./LoadingIndicator";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/auth";

function Form({
  route,
  method,
}: {
  route: string;
  method: "login" | "register";
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "caregiver">("client");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const name = method === "login" ? "Login" : "Register";

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    setLoading(true);
    e.preventDefault();

    try {
      const res = await api.post(route, { username, password, role });
      const { user } = res.data;
      if (method === "login") {
        login(res.data.access, res.data.refresh, res.data.user);
        if (user.role === "caregiver") {
          navigate("/caregiver/dashboard");
        } else {
          navigate("/client/dashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form-container'>
      <h1>{name}</h1>
      <input
        className='form-input'
        type='text'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder='Username'
      />
      <input
        className='form-input'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Password'
      />
      {method === "register" && (
        <select
          name=''
          id=''
          value={role}
          onChange={(e) => setRole(e.target.value as "caregiver" | "client")}
        >
          <option value='caregiver'>caregiver</option>
          <option value='client'>caregiver</option>
        </select>
      )}
      {loading && <LoadingIndicator />}
      <button className='form-button' type='submit'>
        {name}
      </button>
    </form>
  );
}

export default Form;
