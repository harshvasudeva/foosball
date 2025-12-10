/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#ffd700',
                background: '#1a1a1a',
                surface: '#2a2a2a',
            }
        },
    },
    plugins: [],
}
