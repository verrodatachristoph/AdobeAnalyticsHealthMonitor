"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const EmailSchema = z.string().trim().email();
const PasswordSchema = z.string().min(6);

type FormState = {
  ok: boolean;
  message: string;
} | null;

// Magic-link sign-in. No signup — if the email has no provisioned account,
// Supabase returns success anyway (to avoid user enumeration); the user just
// never receives an email.
export async function signInWithMagicLink(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = EmailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    (process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "http://localhost:3000");

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/callback`,
    },
  });

  if (error) {
    return {
      ok: false,
      message: "We couldn't send the sign-in link. Try again in a moment.",
    };
  }

  return {
    ok: true,
    message:
      "If that email has access, we've sent a sign-in link. Check your inbox.",
  };
}

// Password sign-in. Agency staff use this; clients use magic links.
// Redirects to Overview on success — this means the action throws a
// NEXT_REDIRECT internally, which `useActionState` handles.
export async function signInWithPassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const emailResult = EmailSchema.safeParse(formData.get("email"));
  const passwordResult = PasswordSchema.safeParse(formData.get("password"));

  if (!emailResult.success || !passwordResult.success) {
    return {
      ok: false,
      message: "Please enter a valid email and password.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailResult.data,
    password: passwordResult.data,
  });

  if (error) {
    // Vague message — don't leak whether the email exists.
    return {
      ok: false,
      message: "Those credentials didn't match. Try again.",
    };
  }

  redirect("/");
}
