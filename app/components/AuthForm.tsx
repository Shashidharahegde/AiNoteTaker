import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import React from "react";

type Props = {
  type: "login" | "singup ";
};

function AuthForm({ type }: Props) {
  const isLoginForm = type === "login";
  const router = useRouter;
  const [isPending, startTransition] = useTransition();

  
  const handleSubmit = (formData: FormData) => {
    console.log("yay");
  };
  return (
    <form action={handleSubmit}>
      <CardContent className="grid w-full items-center gap-4">
        <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2 space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" disabled={isPending} required />
            </div>
            <div className="grid gap-2 space-y-1.5">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2 py-5">
        <Button type="submit" className="w-full space-y-1.5">
          {isPending ? (<Loader2 className="mr-2 h-4 w-14 animate-spin" />
          ):isLoginForm ? ("Login"):("Signup")}
        </Button>
         <p className="text-xs">
          {isLoginForm
            ? "Don't have an account yet?"
            : "Already have an account?"}{" "}
          <Link
            href={isLoginForm ? "/sign-up" : "/login"}
            className={`${isPending ? "pointer-events-none opacity-50" : ""} text-blue-500 underline`}
          >
            {isLoginForm ? "Sign up" : "Log in"}
          </Link>
        </p>
      </CardFooter>
    </form>
  );
}

export default AuthForm;
