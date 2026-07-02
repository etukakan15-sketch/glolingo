export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const { plan, email } = body;

    const priceIds = {
      premium: context.env.VITE_STRIPE_PRO_PRICE_ID,
      elite: context.env.VITE_STRIPE_ELITE_PRICE_ID,
    };

    const priceId = priceIds[plan];

    if (!priceId) {
      return Response.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      mode: "subscription",
      success_url: `https://glolingoapp.pages.dev/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "https://glolingoapp.pages.dev/signup",
      customer_email: email,
    });

    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${context.env.STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const session = await response.json();

    if (session.error) {
      return Response.json(
        { error: session.error.message },
        { status: 400 }
      );
    }

    return Response.json({ url: session.url });

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}