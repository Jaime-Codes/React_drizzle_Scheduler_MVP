import React, { useState } from "react";
import api from "../api";
import LoadingIndicator from "./LoadingIndicator";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/auth";

interface FormProps {
  route: string;
  method: "login" | "register";
}

export default function Form({ route, method }: FormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    age: "",
    phone: "",
    role: "client" as "client" | "caregiver",
    // Caregiver-specific
    licenseNumber: "",
    hourlyRate: "",
    timezone: "CST",
    bio: "",
    // Client-specific
    address: "",
    emergencyContact: "",
    notes: "",
  });

  const isRegister = method === "register";
  const formTitle = isRegister ? "Register" : "Login";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        ...(isRegister && {
          name: formData.name,
          age: formData.age ? parseInt(formData.age, 10) : null,
          phone: formData.phone,
          // Dynamic role conditional bundling
          profileData:
            formData.role === "caregiver"
              ? {
                  licenseNumber: formData.licenseNumber,
                  hourlyRate: formData.hourlyRate || "0.00",
                  timezone: formData.timezone,
                  bio: formData.bio,
                }
              : {
                  address: formData.address,
                  emergencyContact: formData.emergencyContact,
                  notes: formData.notes,
                },
        }),
      };

      const res = await api.post(route, payload);

      if (method === "login") {
        const { user, access, refresh } = res.data;
        login(access, refresh, user);
        navigate(
          user.role === "caregiver"
            ? "/caregiver/dashboard"
            : "/client/dashboard",
        );
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      alert(error.response?.data?.error || "Registration error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='form-container'>
      <h1>{formTitle}</h1>

      <input
        className='form-input'
        type='email'
        name='username'
        value={formData.username}
        onChange={handleChange}
        placeholder='Email Address'
        required
      />
      <input
        className='form-input'
        type='password'
        name='password'
        value={formData.password}
        onChange={handleChange}
        placeholder='Password'
        required
      />

      {isRegister && (
        <>
          <input
            className='form-input'
            type='text'
            name='name'
            value={formData.name}
            onChange={handleChange}
            placeholder='Full Name'
            required
          />
          <input
            className='form-input'
            type='number'
            name='phone'
            value={formData.phone}
            onChange={handleChange}
            placeholder='Phone Number'
          />
          <input
            className='form-input'
            type='number'
            name='age'
            value={formData.age}
            onChange={handleChange}
            placeholder='Age'
            min='18'
          />

          <label htmlFor='role'>Register Account As:</label>
          <select
            className='form-input'
            name='role'
            id='role'
            value={formData.role}
            onChange={handleChange}
          >
            <option value='client'>Client</option>
            <option value='caregiver'>Caregiver</option>
          </select>

          {/* Render Caregiver Fields Dynamically */}
          {formData.role === "caregiver" && (
            <fieldset
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <legend>Caregiver Profile Info</legend>
              <input
                className='form-input'
                type='text'
                name='licenseNumber'
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder='License Number'
                required
              />
              <input
                className='form-input'
                type='number'
                name='hourlyRate'
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder='Hourly Rate ($)'
                step='0.01'
                required
              />
              <textarea
                className='form-input'
                name='bio'
                value={formData.bio}
                onChange={handleChange}
                placeholder='Brief Bio Description...'
              />
            </fieldset>
          )}

          {/* Render Client Fields Dynamically */}
          {formData.role === "client" && (
            <fieldset
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px 0",
              }}
            >
              <legend>Client Profile Info</legend>
              <input
                className='form-input'
                type='text'
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Home Address'
                required
              />
              <input
                className='form-input'
                type='text'
                name='emergencyContact'
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder='Emergency Contact Phone'
                required
              />
              <textarea
                className='form-input'
                name='notes'
                value={formData.notes}
                onChange={handleChange}
                placeholder='Special medical or care notes...'
              />
            </fieldset>
          )}
        </>
      )}

      {loading && <LoadingIndicator />}
      <button className='form-button' type='submit' disabled={loading}>
        {formTitle}
      </button>
    </form>
  );
}
