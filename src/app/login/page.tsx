"use client";

import { useState } from "react";
import LoginForm from "@/app/login/LoginForm";
import RegisterForm from "@/app/login/RegisterForm";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </main>
  );
}
