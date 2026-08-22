import "server-only";

import { headers } from "next/headers";

export type Visitor = {
  country: string | null;
  region: string | null;
  city: string | null;
  device: string;
  browser: string;
  referrer: string | null;
  bot: boolean;
};

function decodeHeader(value: string | null) {
  if (!value) return null;
  try {
    return decodeURIComponent(value).replace(/\+/g, " ").trim() || null;
  } catch {
    return value.trim() || null;
  }
}

function deviceFrom(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobile|Android|iPhone|iPod/i.test(ua)) return "mobile";
  return "desktop";
}

function browserFrom(ua: string) {
  if (/Edg\//i.test(ua)) return "Edge";
  if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "Safari";
  if (/Firefox\//i.test(ua)) return "Firefox";
  return "Other";
}

function isBot(ua: string) {
  return /bot|crawler|spider|preview|slackbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram|discord/i.test(
    ua,
  );
}

export async function readVisitor(): Promise<Visitor> {
  const h = await headers();
  const ua = h.get("user-agent") || "";
  const country =
    decodeHeader(h.get("x-vercel-ip-country")) ||
    decodeHeader(h.get("cf-ipcountry")) ||
    decodeHeader(h.get("x-country")) ||
    null;
  const city = decodeHeader(h.get("x-vercel-ip-city")) || decodeHeader(h.get("x-city"));
  const region =
    decodeHeader(h.get("x-vercel-ip-country-region")) ||
    decodeHeader(h.get("x-region"));
  const rawRef = h.get("referer");
  let referrer: string | null = null;
  if (rawRef) {
    try {
      const url = new URL(rawRef);
      const host = h.get("host") || "";
      if (url.host && url.host !== host) referrer = url.hostname;
    } catch {
      referrer = null;
    }
  }

  const unknownCountry = !country || country === "XX" || country === "T1";
  return {
    country: unknownCountry ? null : country.toUpperCase(),
    region,
    city,
    device: deviceFrom(ua),
    browser: browserFrom(ua),
    referrer,
    bot: isBot(ua),
  };
}
