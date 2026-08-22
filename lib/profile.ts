export function getProfile() {
  return {
    name: process.env.PORTFOLIO_NAME || "Adrian",
    title: process.env.PORTFOLIO_TITLE || "Independent engineer",
    tagline:
      process.env.PORTFOLIO_TAGLINE || "Selected work, prepared for this role.",
  };
}
