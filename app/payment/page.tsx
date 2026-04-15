"use client";

import Script from "next/script";
import { CheckCircle2, Crown, Sparkles } from "lucide-react";
import { useState } from "react";
declare global { interface Window { Razorpay: any; } }

const perks = ["Higher quiz limits", "Premium gameplay experience", "Cleaner upgrade flow", "Faster access to advanced features"];

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);

  const startPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 19900 })
      });
      const order = await res.json();
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Quizmify Pro",
        description: "Upgrade to Pro plan",
        handler: async function (response: any) {
          await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response)
          });
          alert("Payment successful.");
        }
      });
      rzp.open();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_0.85fr]">
        <section className="glass-panel p-8 md:p-10">
          <span className="badge-pro mb-4">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Premium plan
          </span>
          <h1 className="section-title">Upgrade to Quizmify Pro</h1>
          <p className="section-copy mt-3 max-w-2xl">
            Unlock premium features and deliver a more polished experience for advanced quiz creation and competitive learning.
          </p>
          <div className="mt-8 rounded-[28px] bg-slate-950 p-7 text-white shadow-2xl shadow-slate-900/15">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Pro membership</p>
                <h2 className="mt-1 text-4xl font-semibold">₹199</h2>
              </div>
              <div className="rounded-2xl bg-white/10 p-3"><Crown className="h-5 w-5" /></div>
            </div>
            <button className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100" onClick={startPayment} disabled={loading}>
              {loading ? "Processing..." : "Continue to payment"}
            </button>
          </div>
        </section>

        <aside className="dashboard-card">
          <h2 className="text-2xl font-semibold text-slate-950">What you unlock</h2>
          <div className="mt-5 space-y-4">
            {perks.map((perk) => (
              <div key={perk} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <p className="text-sm text-slate-700">{perk}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
