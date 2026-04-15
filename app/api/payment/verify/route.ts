import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing Razorpay verification fields" },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "RAZORPAY_KEY_SECRET is not configured" },
        { status: 500 }
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: razorpay_order_id, userId: session.user.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        { error: "Invalid Razorpay signature" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        status: "PAID",
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { isPro: true },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return NextResponse.json(
      { error: "Unable to verify payment" },
      { status: 500 }
    );
  }
}
