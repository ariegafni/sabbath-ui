"use client";

import { useState } from "react";

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login Data:", form);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow p-6 space-y-4"
      >
        <h2 className="text-lg font-bold">התחברות</h2>

        <input
          type="text"
          name="name"
          placeholder="שם"
          value={form.name}
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
          className="w-full bg-blue-600 text-white rounded-md py-2"
        >
          כניסה
        </button>

        <p className="text-sm text-center">
          אין לך חשבון?{" "}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:underline"
          >
            צור חשבון
          </button>
        </p>
      </form>
    </div>
  );
}
