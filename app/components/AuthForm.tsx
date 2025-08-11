"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import React from "react";
import { loginAction, signUpAction } from "../actions/users";
import { toast } from 'react-toastify'

type Props = {
  type: "login" | "signUp";
};

function AuthForm({ type }: Props) {
  const isLoginForm = type === "login";
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = (formData.get("email") as string)?.trim();
      const password = formData.get("password") as string;

      try {
        const { errorMessage } = isLoginForm
          ? await loginAction(email, password)
          : await signUpAction(email, password);

        if (!errorMessage) {
          router.replace(`/?toastType=${type}`);
        } else {
          toast.error(errorMessage);
           console.log(errorMessage);
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
        // console.error(err);
      }
    });
  };

  return (
    <form action={handleSubmit} noValidate>
      <CardContent className="grid w-full items-center gap-4">
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="Enter your email"
            type="email"
            autoComplete="email"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            placeholder="Enter your password"
            type="password"
            autoComplete={isLoginForm ? "current-password" : "new-password"}
            required
            disabled={isPending}
          />
        </div>
      </CardContent>

      <CardFooter className="mt-4 flex flex-col gap-6">
        <Button
          className="w-full"
          type="submit"
          disabled={isPending}
          aria-disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? <Loader2 className="animate-spin" /> : isLoginForm ? "Login" : "Sign Up"}
        </Button>

        <p className="text-xs">
          {isLoginForm ? "Don't have an account yet?" : "Already have an account?"}{" "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className={`text-blue-500 underline ${isPending ? "pointer-events-none opacity-50" : ""}`}
            aria-disabled={isPending}
          >
            {isLoginForm ? "Sign Up" : "Login"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default AuthForm;
