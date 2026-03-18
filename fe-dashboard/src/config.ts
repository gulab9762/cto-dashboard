export const config = {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
    isDev: import.meta.env.DEV,
    port: parseInt(import.meta.env.VITE_PORT || '5173'),
};
