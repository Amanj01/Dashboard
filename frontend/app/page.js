"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard if the user is authenticated
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  return null; // This will show nothing since the user will be redirected
}
