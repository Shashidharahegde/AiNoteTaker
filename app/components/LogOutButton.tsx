"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";
import {toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { logOutAction } from "../actions/users";

function LogOutButton() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleLogOut = async () => {
    console.log("Logging out...");
    setLoading(true);

    try {
      const {errorMessage} = await logOutAction();
      toast.success("Logged out successfully");
    } catch (err) {
      console.error(err);
      toast.error("An error has occurred");
    } finally {
      setLoading(false);
      router.push("/login");
    }
  };

  return (
    <Button
      className="w-22"
      onClick={handleLogOut}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        "Log Out"
      )}
    </Button>
  );
}

export default LogOutButton;
