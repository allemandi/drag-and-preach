import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		colors: {
        pastel: {
          blue: 'var(--pastel-blue)',
          green: 'var(--pastel-green)',
          amber: 'var(--pastel-amber)',
          purple: 'var(--pastel-purple)',
          rose: 'var(--pastel-rose)',
        },
        'pastel-border': {
          blue: 'var(--pastel-border-blue)',
          green: 'var(--pastel-border-green)',
          amber: 'var(--pastel-border-amber)',
          purple: 'var(--pastel-border-purple)',
          rose: 'var(--pastel-border-rose)',
        },
        'pastel-text': {
          blue: 'var(--pastel-text-blue)',
          green: 'var(--pastel-text-green)',
          amber: 'var(--pastel-text-amber)',
          purple: 'var(--pastel-text-purple)',
          rose: 'var(--pastel-text-rose)',
        },
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
