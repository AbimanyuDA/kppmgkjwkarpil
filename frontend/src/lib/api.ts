// ...existing code...
// Only keep API functions for Next.js API routes (Supabase)
export async function loginApi(email: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login gagal");
  }
  return res.json();
}
