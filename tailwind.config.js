/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise-neutral color palette for ART
        // Status badge colors from design document
        status: {
          fresh: {
            bg: '#F3F4F6',      // Light gray
            text: '#374151',    // Dark gray
          },
          reviewDue: {
            bg: '#FEF3C7',      // Light amber
            text: '#92400E',    // Amber
          },
          stale: {
            bg: '#F1F5F9',      // Light slate
            text: '#475569',    // Slate
            border: '#CBD5E1',  // Slate border
          },
        },
      },
    },
  },
  plugins: [],
}
