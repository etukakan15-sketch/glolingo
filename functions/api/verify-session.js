export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const sessionId = url.searchParams.get("session_id");

    if (!sessionId) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`,
      {
        headers: {
          Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
        },
      }
    );

    const session = await response.json();

    if (session.error) {
      return Response.json({ error: session.error.message }, { status: 400 });
    }

    if (session.payment_status !== "paid") {
      return Response.json(
        { error: "Payment not completed for this session." },
        { status: 400 }
      );
    }

    // Determine the actual plan purchased by matching the price ID Stripe
    // charged against our known price IDs — never trust a client-supplied plan.
    const priceId = session.line_items?.data?.[0]?.price?.id;
    const priceMap = {
      [context.env.VITE_STRIPE_PRO_PRICE_ID]: "premium",
      [context.env.VITE_STRIPE_ELITE_PRICE_ID]: "elite",
    };
    const plan = priceMap[priceId];

    if (!plan) {
      return Response.json(
        { error: "Could not determine plan for this session." },
        { status: 400 }
      );
    }

    const email = session.customer_details?.email || session.customer_email || null;

    return Response.json({
      verified: true,
      plan,
      email,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
