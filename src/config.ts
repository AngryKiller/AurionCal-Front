declare global {
  interface Window {
    settings?: {
      VITE_API_BASE_URL: string;
    };
  }
}

const config = {
  API_BASE_URL:
    (window.settings && window.settings.VITE_API_BASE_URL) ||
    process.env.VITE_API_BASE_URL,
};

export default config;
