import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { amount = 19900 } = await req.json();
  const order = await razorpay.orders.create({
    amount: Number(amount),
    currency: "INR",
    receipt: `quizmify_${Date.now()}`
  });
  await prisma.payment.create({
    data: {
      userId: session.user.id,
      amount: Math.round(Number(amount) / 100),
      currency: "INR",
      razorpayOrderId: order.id
    }
  });
  return NextResponse.json(order);
}
