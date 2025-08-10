"use client";

import { useState } from "react";

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register Data:", form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto bg-white rounded-lg shadow p-6 space-y-4"
      dir="rtl"
    >
      <h2 className="text-lg font-bold">רישום</h2>

      <input
        type="text"
        name="firstName"
        placeholder="שם פרטי"
        value={form.firstName}
        onChange={handleChange}
        className="w-full border rounded-md p-2"
      />
      <input
        type="text"
        name="lastName"
        placeholder="שם משפחה"
        value={form.lastName}
        onChange={handleChange}
        className="w-full border rounded-md p-2"
      />
      <input
        type="email"
        name="email"
        placeholder="אימייל"
        value={form.email}
        onChange={handleChange}
        className="w-full border rounded-md p-2"
      />
      <input
        type="password"
        name="password"
        placeholder="סיסמה"
        value={form.password}
        onChange={handleChange}
        className="w-full border rounded-md p-2"
      />

      <button
        type="submit"
        className="w-full bg-green-600 text-white rounded-md py-2"
      >
        הרשמה
      </button>

      <p className="text-sm text-center">
        כבר יש לך חשבון?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          התחבר
        </button>
      </p>
    </form>
  );
}
