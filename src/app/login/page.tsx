"use client";

import { useState } from "react";
import LoginForm from "@/app/login/LoginForm";
import RegisterForm from "@/app/login/RegisterForm";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="w-full max-w-sm">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </main>
  );
}
