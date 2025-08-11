"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: Props) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register Data:", form);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          הרשמה
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">צרו חשבון חדש</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        {/* שם פרטי */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            שם פרטי
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="firstName"
              placeholder="הכנס את שמך הפרטי"
              value={form.firstName}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* שם משפחה */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            שם משפחה
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="lastName"
              placeholder="הכנס את שם המשפחה שלך"
              value={form.lastName}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* אימייל */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            אימייל
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="הכנס את האימייל שלך"
              value={form.email}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* סיסמה */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            סיסמה
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              placeholder="הכנס סיסמה חזקה"
              value={form.password}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>

        {/* כפתור הרשמה */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          הרשמה
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* קישור להתחברות */}
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            כבר יש לך חשבון?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
            >
              התחבר לחשבון שלך
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
