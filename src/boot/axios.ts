/*import { boot } from 'quasar/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'stores/auth-store';
import { Notify } from 'quasar';
import config from 'src/config';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: config.API_BASE_URL });

export default boot(({ app, store }) => {
  const auth = useAuthStore(store);

  api.interceptors.request.use((config) => {
    if (auth.token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${auth.token}`,
      };
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        Notify.create({ type: 'negative', message: 'Identifiants incorrects' });
        auth.logout();
      }
      return Promise.reject(error as Error);
    }
  );

  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
*/
