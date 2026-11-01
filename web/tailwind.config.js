/** Design tokens: calm, high-contrast, large type for senior users. */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12263A",        // body text (contrast 14:1 on paper)
        paper: "#F4F7FB",      // page background (cool, not cream)
        panel: "#FFFFFF",
        line: "#C9D6DF",
        brand: { DEFAULT: "#1F5FBF", dark: "#174A94", soft: "#E3EDFB" }, // clear blue
        ok: { DEFAULT: "#17613A", soft: "#DDF3E5" },     // verified
        warn: { DEFAULT: "#8A4B00", soft: "#FFEBCC" },   // pending / please verify
        alert: { DEFAULT: "#A3201B", soft: "#FCE3E1" },  // High / Low values
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
      },
      fontSize: { base: ["1.125rem", "1.7rem"], lg: ["1.3rem", "1.8rem"] }, // bigger base = 18px
    },
  },
  plugins: [],
};
