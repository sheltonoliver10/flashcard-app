"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useEffect, Suspense } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    const type = searchParams.get("type");
    const token = searchParams.get("access_token") || searchParams.get("token");

    if (type === "recovery" && token) {
      router.replace(`/auth/reset-password?access_token=${token}&type=${type}`);
      return;
    }

    router.replace("/");
  }, [searchParams, router]);

  return <p className="text-center p-6">Redirecting…</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p className="text-center p-6">Loading…</p>}>
      <AuthCallbackContent />
    </Suspense>
  );
}

