// src/app/api/trainer-lead/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, city, edu, wants, msg, turnstileToken } = body ?? {};

    if (!name || !email || !turnstileToken) {
      return NextResponse.json(
        { error: "Mangler obligatoriske felter (name, email, turnstileToken)." },
        { status: 400 }
      );
    }

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (!turnstileSecret) {
      return NextResponse.json({ error: "Server mangler TURNSTILE_SECRET_KEY." }, { status: 500 });
    }

    // 1) Verify Turnstile
    const formData = new FormData();
    formData.append("secret", turnstileSecret);
    formData.append("response", String(turnstileToken));

    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const verifyData = await verifyRes.json();

    if (!verifyData?.success) {
      return NextResponse.json(
        { error: "Turnstile feilet. Prøv igjen." },
        { status: 403 }
      );
    }

    // 2) Send email (Resend)
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server mangler RESEND_API_KEY." }, { status: 500 });
    }

    /**
     * Viktig:
     * - Resend krever at FROM-domain er verifisert.
     * - Du har verifisert send.smertefri.no (ikke smertefri.no).
     */
    const toEmail = process.env.LEADS_TO_EMAIL || "rehab@smertefri.no"; // hvor du vil motta leaden
    const fromEmail =
      process.env.LEADS_FROM_EMAIL || "Rehab <rehab@send.smertefri.no>"; // må være verifisert domain

    const resend = new Resend(apiKey);

    const safeName = String(name).trim();
    const safeWants = String(wants ?? "").trim();

    const subject = `Ny trener-henvendelse: ${safeName}${safeWants ? ` (${safeWants})` : ""}`;

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Ny henvendelse fra trener</h2>
        <p><strong>Navn:</strong> ${escapeHtml(safeName)}</p>
        <p><strong>E-post:</strong> ${escapeHtml(String(email))}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(String(phone ?? ""))}</p>
        <p><strong>By/arbeidssted:</strong> ${escapeHtml(String(city ?? ""))}</p>
        <p><strong>Utdanning:</strong> ${escapeHtml(String(edu ?? ""))}</p>
        <p><strong>Ønsker:</strong> ${escapeHtml(String(wants ?? ""))}</p>
        <p><strong>Melding:</strong><br/>${escapeHtml(String(msg ?? "")).replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p style="color:#666;font-size:12px">Sendt fra: smertefri.no/trenere</p>
      </div>
    `;

    const sendRes = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: String(email), // gjør at "Svar" går til treneren
      subject,
      html,
    });

    if (sendRes.error) {
      return NextResponse.json(
        { error: `Kunne ikke sende e-post: ${sendRes.error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Ukjent feil." }, { status: 500 });
  }
}

// liten sikkerhet for HTML
function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}