export function flagEmoji(country: string | null | undefined) {
  if (!country || country.length !== 2) return "";
  const code = country.toUpperCase();
  return String.fromCodePoint(...[...code].map((char) => 127397 + char.charCodeAt(0)));
}

export function formatPlace(view: {
  city?: string | null;
  region?: string | null;
  country?: string | null;
}) {
  const flag = flagEmoji(view.country);
  const parts = [view.city, view.region, view.country].filter(Boolean);
  if (parts.length === 0) return flag ? `${flag} Unknown` : "Location unknown";
  return `${flag ? `${flag} ` : ""}${parts.join(", ")}`;
}
