const formatters = new Map();

/** 259 -> "$259". Whole amounts are shown without decimals. */
export function formatPrice(amount, currency = "USD") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "";
  let formatter = formatters.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

export const plural = (count, one, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;

/** Great-circle distance in km between two {lat, lng} points. */
export function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Spec values that the data file itself marks as unknown ("Not verified…", "Not specified…"). */
export const isUnverifiedSpec = (value) => /not (verified|specified)|verify before|material not verified/i.test(String(value));

/** "Quartz (demo; verify)" -> "Quartz". The demo/verify status is shown once, in a notice. */
export const cleanSpec = (value) => String(value).replace(/\s*\((demo; )?verify\)\s*$/i, "").trim();
