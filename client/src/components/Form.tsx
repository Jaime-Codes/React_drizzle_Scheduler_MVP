import React, { useState } from "react";
import {
  TextInput,
  PasswordInput,
  Select,
  Textarea,
  Button,
  Paper,
  Title,
  Container,
  Fieldset,
  LoadingOverlay,
} from "@mantine/core";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/auth";
import api from "../api";

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
    licenseNumber: "",
    hourlyRate: "",
    timezone: "CST",
    bio: "",
    address: "",
    emergencyContact: "",
    notes: "",
  });

  const isRegister = method === "register";
  const formTitle = isRegister ? "Create an Account" : "Sign In";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    setFormData((prev) => ({ ...prev, [name]: value || "" }));
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
      alert(
        error.response?.data?.error || "Authentication structural failure.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size={460} my={40}>
      <Paper
        withBorder
        shadow='md'
        p={30}
        radius='md'
        style={{ position: "relative" }}
      >
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Title order={2} ta='center' mb='lg' fw={800}>
          {formTitle}
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label='Email Address'
            placeholder='you@example.com'
            name='username'
            value={formData.username}
            onChange={handleInputChange}
            required
            mb='md'
          />
          <PasswordInput
            label='Password'
            placeholder='Your password'
            name='password'
            value={formData.password}
            onChange={handleInputChange}
            required
            mb='md'
          />

          {isRegister && (
            <>
              <TextInput
                label='Full Name'
                placeholder='John Doe'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                required
                mb='md'
              />
              <TextInput
                label='Phone Number'
                placeholder='555-555-5555'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                mb='md'
              />
              <TextInput
                label='Age'
                placeholder='Min 18'
                type='number'
                name='age'
                value={formData.age}
                onChange={handleInputChange}
                mb='md'
              />

              <Select
                label='Account Profile Role'
                data={[
                  { value: "client", label: "Client Seeking Care" },
                  { value: "caregiver", label: "Caregiver Professional" },
                ]}
                value={formData.role}
                onChange={(val) => handleSelectChange("role", val)}
                mb='md'
              />

              {formData.role === "caregiver" && (
                <Fieldset
                  legend='Professional Credentials'
                  mb='md'
                  variant='filled'
                >
                  <TextInput
                    label='License Number'
                    placeholder='RN / CNA state registry tag'
                    name='licenseNumber'
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                    required
                    mb='sm'
                  />
                  <TextInput
                    label='Hourly Rate ($)'
                    placeholder='35.00'
                    type='number'
                    name='hourlyRate'
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    required
                    mb='sm'
                  />
                  <Textarea
                    label='Professional Bio'
                    placeholder='Tell clients about your specialty care background...'
                    name='bio'
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </Fieldset>
              )}

              {formData.role === "client" && (
                <Fieldset legend='Care Requirements' mb='md' variant='filled'>
                  <TextInput
                    label='Home Address'
                    placeholder='123 Care Lane'
                    name='address'
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    mb='sm'
                  />
                  <TextInput
                    label='Emergency Contact Phone'
                    placeholder='555-555-5555'
                    name='emergencyContact'
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    required
                    mb='sm'
                  />
                  <Textarea
                    label='Medical Care Notes'
                    placeholder='Detail dietary, mobility, or medication schedule instructions...'
                    name='notes'
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </Fieldset>
              )}
            </>
          )}

          <Button type='submit' fullWidth mt='xl' size='md' color='blue'>
            {isRegister ? "Complete Sign Up" : "Authorize Session"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
