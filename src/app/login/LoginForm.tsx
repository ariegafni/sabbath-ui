"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { AuthService } from "@/service";
import { useAuth } from "@/Providers/AuthProvider";

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      console.log("Attempting login with:", { email: form.email.trim(), password: "***" });
      
      const res = await AuthService.login({
        email: form.email.trim(),
        password: form.password,
      });
      // Persist tokens and user for the app
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      // Mirror to cookie for middleware protection
      document.cookie = `auth=${res.access_token}; path=/; max-age=604800; samesite=lax; secure=${window.location.protocol === 'https:'}`;
      // Refresh auth context and redirect
      await refresh();
      router.replace("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "שגיאה בהתחברות";
      alert(errorMessage);
      console.error("Login failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {t("auth.welcome")}
        </h1>
        <p className="text-blue-100 text-sm sm:text-base">
          {t("auth.loginSubtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.fullName")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              placeholder={t("auth.fullNamePlaceholder")}
              value={form.name}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.email")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              placeholder={t("auth.emailPlaceholder")}
              value={form.email}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {t("auth.password")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              name="password"
              placeholder={t("auth.passwordPlaceholder")}
              value={form.password}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          disabled={loading}
        >
          {loading ? t("auth.loggingIn") : t("auth.login")}
          <ArrowRight className="h-4 w-4" />
        </button>
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            {t("auth.noAccount")}{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
            >
              {t("auth.createAccount")}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
