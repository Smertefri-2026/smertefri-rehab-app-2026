import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, wants, msg, turnstileToken, source } = body ?? {};

    if (!name || !email || !turnstileToken) {
      return NextResponse.json({ error: "Mangler obligatoriske felter." }, { status: 400 });
    }

    // 1) Verify Turnstile
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return NextResponse.json({ error: "Server mangler TURNSTILE_SECRET_KEY." }, { status: 500 });
    }

    const formData = new FormData();
    formData.append("secret", turnstileSecret);
    formData.append("response", String(turnstileToken));

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const verifyData = await verifyRes.json();
    if (!verifyData?.success) {
      return NextResponse.json({ error: "Turnstile feilet. Prøv igjen." }, { status: 403 });
    }

    // 2) Send email via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server mangler RESEND_API_KEY." }, { status: 500 });
    }

    const resend = new Resend(apiKey);

    const toEmail = process.env.LEADS_TO_EMAIL || "rehab@smertefri.no";
    // Viktig: bruk verifisert avsenderdomene (send.smertefri.no)
    const fromEmail = process.env.LEADS_FROM_EMAIL || "SmerteFri AS <rehab@send.smertefri.no>";

    const subject = `Ny henvendelse (${String(source || "public")}): ${String(name)} (${String(wants || "info")})`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Ny henvendelse via ${escapeHtml(String(source || "public"))}</h2>
        <p><strong>Navn:</strong> ${escapeHtml(String(name))}</p>
        <p><strong>E-post:</strong> ${escapeHtml(String(email))}</p>
        <p><strong>Ønsker:</strong> ${escapeHtml(String(wants ?? ""))}</p>
        <p><strong>Melding:</strong><br/>${escapeHtml(String(msg ?? "")).replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#666;font-size:12px">Sendt fra SmerteFri-nettsiden</p>
      </div>
    `;

    const sendRes = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: String(email),
      subject,
      html,
    });

    if ((sendRes as any)?.error) {
      return NextResponse.json(
        { error: `Kunne ikke sende e-post: ${(sendRes as any).error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ukjent feil." }, { status: 500 });
  }
}

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}