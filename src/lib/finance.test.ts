import { describe, expect, it } from "vitest";
import { buildInsights, goalProgress, monthsToReach, summarize, type Tx } from "./finance";

const tx = (p: Partial<Tx>): Tx => ({
  id: Math.random().toString(),
  type: "expense",
  amount: 10,
  category: "Outros",
  description: "",
  occurred_on: "2026-10-10",
  ...p,
});

describe("summarize", () => {
  it("computes monthly income, expense, savings and all-time balance", () => {
    const s = summarize(
      [
        tx({ type: "income", amount: 3000, category: "Trabalho" }),
        tx({ amount: 45, category: "Alimentação" }),
        tx({ amount: 120, category: "Moradia" }),
        tx({ type: "income", amount: 500, occurred_on: "2026-09-01" }),
      ],
      "2026-10",
    );
    expect(s.income).toBe(3000);
    expect(s.expense).toBe(165);
    expect(s.savings).toBe(2835);
    expect(s.balance).toBe(3335);
    expect(s.categories[0]).toEqual({ category: "Moradia", total: 120 });
  });
});

describe("goalProgress", () => {
  it("computes remaining, percent and months left", () => {
    const p = goalProgress({ id: "1", title: "Viagem", target_amount: 5000, saved_amount: 2600, monthly_contribution: 200 });
    expect(p.remaining).toBe(2400);
    expect(p.percent).toBe(52);
    expect(p.monthsLeft).toBe(12);
  });
  it("returns null months when no monthly contribution", () => {
    expect(goalProgress({ id: "1", title: "x", target_amount: 100, saved_amount: 0, monthly_contribution: null }).monthsLeft).toBeNull();
  });
  it("caps percent at 100", () => {
    expect(goalProgress({ id: "1", title: "x", target_amount: 100, saved_amount: 150, monthly_contribution: null }).percent).toBe(100);
  });
});

describe("monthsToReach", () => {
  it("saving R$200/month reaches R$2400 in 12 months", () => {
    expect(monthsToReach(2400, 200)).toBe(12);
  });
});

describe("buildInsights", () => {
  it("alerts after 5 days without records", () => {
    const ins = buildInsights([tx({ occurred_on: "2026-10-05" })], [], "2026-10-10");
    expect(ins.find((i) => i.id === "inactive")?.text).toContain("5 dias");
  });
  it("flags goal at 80%", () => {
    const ins = buildInsights([], [{ id: "g", title: "Carro", target_amount: 1000, saved_amount: 800, monthly_contribution: null }], "2026-10-10");
    expect(ins.some((i) => i.id === "goal-80-g")).toBe(true);
  });
  it("reports % more spent on a category vs last month", () => {
    const ins = buildInsights(
      [tx({ category: "Alimentação", amount: 100, occurred_on: "2026-09-10" }), tx({ category: "Alimentação", amount: 118, occurred_on: "2026-10-09" })],
      [],
      "2026-10-10",
    );
    expect(ins.find((i) => i.id === "cat-Alimentação")?.text).toContain("18% mais");
  });
});
