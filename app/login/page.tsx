"use client";
import React from "react";
import { Card, CardTitle } from "@/components/ui/card";
import AuthForm from "../components/AuthForm";

function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
        <AuthForm type="login" />
      </Card>
    </div>
  );
}

export default LoginPage;
