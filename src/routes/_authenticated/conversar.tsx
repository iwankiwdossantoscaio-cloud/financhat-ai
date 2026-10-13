import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Mic, Send, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendChatMessage } from "@/lib/chat.functions";
import { messagesQuery, useProfile, type ChatMsg } from "@/lib/queries";
import { speak, useVoiceInput } from "@/hooks/use-voice";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/conversar")({
  head: () => ({ meta: [{ title: "Conversar — FinanChat" }, { name: "description", content: "Converse com seu assistente financeiro." }, { property: "og:title", content: "Conversar — FinanChat" }, { property: "og:description", content: "Converse com seu assistente financeiro." }] }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "Gastei R$ 45 no mercado hoje",
  "Recebi R$ 3.000 de salário",
  "Paguei R$ 120 de internet",
  "Quero juntar R$ 5.000 para uma viagem",
  "Quanto gastei este mês?",
];

function ChatPage() {
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { data: messages = [] } = useQuery(messagesQuery);
  const send = useServerFn(sendChatMessage);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [pendingUser, setPendingUser] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (t: string) => send({ data: { text: t } }),
    onMutate: (t) => setPendingUser(t),
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["messages"] });
      setPendingUser(null);
      if (res.confirmations.length) {
        res.confirmations.forEach((c) => toast.success(c.label, { description: c.detail }));
        qc.invalidateQueries({ queryKey: ["transactions"] });
        qc.invalidateQueries({ queryKey: ["goals"] });
      }
      if (res.error) toast.error(res.reply);
      inputRef.current?.focus();
    },
    onError: () => {
      setPendingUser(null);
      toast.error("Não foi possível enviar. Verifique sua internet.");
    },
  });

  const voice = useVoiceInput((t) => submit(t));

  function submit(t: string) {
    const v = t.trim();
    if (!v || mutation.isPending) return;
    setText("");
    mutation.mutate(v);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pendingUser, mutation.isPending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const firstName = profile?.name?.split(" ")[0];
  const all: ChatMsg[] = pendingUser
    ? [...messages, { id: "pending", role: "user", content: pendingUser, actions: [], created_at: new Date().toISOString() }]
    : messages;

  return (
    <div className="flex h-[calc(100dvh-5.5rem-env(safe-area-inset-bottom))] flex-col bg-chat-bg">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <span className="grid size-11 place-items-center rounded-full bg-primary text-xl text-primary-foreground" aria-hidden>💬</span>
        <div>
          <h1 className="text-lg font-bold leading-tight">FinanChat</h1>
          <p className="text-sm text-muted-foreground">{mutation.isPending ? "digitando…" : "seu assistente financeiro"}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4" role="log" aria-live="polite" aria-label="Conversa">
        {all.length === 0 && (
          <div className="mx-auto max-w-[85%] rounded-2xl bg-bubble-ai p-4 shadow-soft animate-pop">
            <p className="text-lg">Olá{firstName ? `, ${firstName}` : ""}! 👋</p>
            <p className="mt-2 text-base text-muted-foreground">
              Me conte seus gastos e ganhos do seu jeito. Por exemplo: <strong className="text-foreground">“almoço 30 reais”</strong>. Eu organizo tudo para você.
            </p>
          </div>
        )}
        <ul className="space-y-3">
          {all.map((m) => (
            <li key={m.id} className={cn("flex animate-pop", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-base leading-relaxed shadow-soft",
                  m.role === "user" ? "rounded-br-md bg-bubble-user text-bubble-user-foreground" : "rounded-bl-md bg-bubble-ai text-card-foreground",
                )}
              >
                <span className="sr-only">{m.role === "user" ? "Você disse:" : "FinanChat disse:"}</span>
                <p className="whitespace-pre-wrap">{m.content}</p>
                {m.actions?.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {m.actions.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-xl bg-primary-soft px-3 py-2 text-sm font-semibold text-accent-foreground">
                        <CheckCircle2 aria-hidden className="size-4 shrink-0" />
                        <span>{a.label} · {a.detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {m.role === "assistant" && (
                  <button
                    onClick={() => speak(m.content)}
                    className="tap -mb-2 -ml-2 mt-1 inline-flex items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                    aria-label="Ouvir esta mensagem"
                  >
                    <Volume2 aria-hidden className="size-4" /> Ouvir
                  </button>
                )}
              </div>
            </li>
          ))}
          {mutation.isPending && (
            <li className="flex justify-start" aria-label="FinanChat está digitando">
              <div className="flex gap-1.5 rounded-2xl rounded-bl-md bg-bubble-ai px-4 py-4 shadow-soft">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-2.5 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </li>
          )}
        </ul>
        <div ref={endRef} />
      </div>

      <div className="border-t bg-card">
        <div className="flex gap-2 overflow-x-auto px-4 pt-3 [scrollbar-width:none]" aria-label="Sugestões rápidas">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              disabled={mutation.isPending}
              className="min-h-11 shrink-0 rounded-full border-2 border-border bg-background px-4 text-sm font-semibold hover:border-primary disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        {(voice.listening || voice.error) && (
          <p className={cn("px-4 pt-2 text-base", voice.error ? "text-destructive" : "text-primary")} role="status">
            {voice.error ?? (voice.interim ? `“${voice.interim}”` : "Estou ouvindo… pode falar.")}
          </p>
        )}
        <form
          className="flex items-end gap-2 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(text);
          }}
        >
          <label htmlFor="msg" className="sr-only">Escreva sua mensagem</label>
          <textarea
            id="msg"
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(text);
              }
            }}
            placeholder="Ex.: gastei 50 no almoço"
            className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border-2 border-input bg-background px-4 py-2.5 text-lg placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          {text.trim() ? (
            <Button type="submit" size="icon" className="rounded-full" disabled={mutation.isPending} aria-label="Enviar mensagem">
              <Send />
            </Button>
          ) : voice.supported ? (
            <Button
              type="button"
              size="icon"
              variant={voice.listening ? "destructive" : "default"}
              className={cn("rounded-full", voice.listening && "animate-listening")}
              onClick={voice.listening ? voice.stop : voice.start}
              disabled={mutation.isPending}
              aria-label={voice.listening ? "Parar de gravar" : "Falar mensagem"}
              aria-pressed={voice.listening}
            >
              {voice.listening ? <Square /> : <Mic />}
            </Button>
          ) : (
            <Button type="submit" size="icon" className="rounded-full" disabled aria-label="Enviar mensagem">
              <Send />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
