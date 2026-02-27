const FALLBACK_SITE_URL = "https://kambouniwersum.netlify.app";

function resolveSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (!envUrl) {
    return FALLBACK_SITE_URL;
  }

  try {
    return new URL(envUrl).origin;
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export const siteConfig = {
  name: "Kambo Uniwersum",
  description: "Najnowsze filmy i statystyki z kambodżańskiego uniwersum YouTube. Polacy w kambodży.",
  url: resolveSiteUrl(),
};
