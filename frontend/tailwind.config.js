/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,jsx}", 
        "./components/**/*.{js,jsx}", 
    ],
    theme: {
        extend: {
            colors: {
                'dark': '#010010',
                'dark-purple': '#0E0C24',
                'purple': '#673AB7',
                'light-gray': '#D3D3D3',
            },
            fontFamily: {
                'open-sans': 'var(--font-open-sans)'
            }
        }
    },
    plugins: [],
};
