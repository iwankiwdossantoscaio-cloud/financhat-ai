import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).optional() }),
  head: () => ({
    meta: [
      { title: "Entrar — FinanChat" },
      { name: "description", content: "Entre ou crie sua conta no FinanChat." },
      { property: "og:title", content: "Entrar — FinanChat" },
      { property: "og:description", content: "Entre ou crie sua conta no FinanChat." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/conversar" },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/conversar" });
        else setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/conversar" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(
        msg.includes("Invalid login") ? "E-mail ou senha incorretos." :
        msg.includes("already registered") ? "Este e-mail já tem conta. Toque em “Entrar”." :
        msg.includes("Password") ? "A senha precisa ter pelo menos 6 caracteres." :
        "Não foi possível continuar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/conversar" });
  }

  if (sent) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 text-center">
        <p className="text-5xl" aria-hidden>📬</p>
        <h1 className="mt-4 text-2xl font-bold">Confira seu e-mail</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Enviamos um link para <strong className="text-foreground">{email}</strong>. Toque nele para ativar sua conta.
        </p>
        <Button variant="outline" className="mt-8" onClick={() => { setSent(false); setMode("signin"); }}>
          Já confirmei, quero entrar
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      <Button asChild variant="ghost" size="icon" aria-label="Voltar">
        <Link to="/"><ArrowLeft /></Link>
      </Button>
      <h1 className="mt-4 text-3xl font-bold">{mode === "signup" ? "Criar sua conta" : "Bem-vindo de volta"}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {mode === "signup" ? "Leva menos de um minuto." : "Entre para continuar sua conversa."}
      </p>

      <Button variant="outline" size="lg" className="mt-8 w-full" onClick={google}>
        <svg viewBox="0 0 24 24" aria-hidden className="size-5"><path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.2z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10l3.7-2.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
        Continuar com Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou use seu e-mail <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-base">E-mail</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-13 text-lg" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-base">Senha</Label>
          <Input id="password" type="password" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="h-13 text-lg" />
          {mode === "signup" && <p className="text-sm text-muted-foreground">Pelo menos 6 caracteres.</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Aguarde…" : mode === "signup" ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <button
        type="button"
        className="tap mt-6 text-base font-semibold text-primary underline-offset-4 hover:underline"
        onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
      >
        {mode === "signup" ? "Já tenho conta — Entrar" : "Não tenho conta — Criar agora"}
      </button>
    </main>
  );
}
