import { defineStore, acceptHMRUpdate } from 'pinia';
import jwtDecode from 'jwt-decode';
import { Client, ApiException } from '../api/business';
import config from 'src/config';

export interface DecodedJwt {
  exp?: number; // epoch seconds
  // Données supplémentaires du JWT; utilisation de unknown pour éviter any.
  [key: string]: unknown;
}

const TOKEN_KEY = 'auth.token';
const EMAIL_KEY = 'auth.email';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function getStoredEmail() {
  return localStorage.getItem(EMAIL_KEY);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getStoredToken(),
    userEmail: getStoredEmail(),
    loading: false,
    error: null as string | null,
    tokenExpiry: null as number | null,
    autoLogoutTimeoutId: null as number | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    secondsUntilExpiry: (state) => {
      if (!state.tokenExpiry) return null;
      return Math.max(0, Math.floor((state.tokenExpiry - Date.now()) / 1000));
    },
  },
  actions: {
    async login(email: string, password: string) {
      this.error = null;
      this.loading = true;
      try {
        const client = new Client(config.API_BASE_URL);
        const resp = await client.aurionCalApiEndpointsCheckLoginInfoEndpoint({ email, password });
        if (resp?.isValid && resp.token) {
          this.setAuthData(resp.token, email);
          return true;
        } else {
          this.error = resp?.message || 'Identifiants incorrects';
          return false;
        }
      } catch (e) {
        const err = e as Error;
        if (err instanceof ApiException && err.status === 401) {
          this.error = 'Identifiants incorrects';
          return false;
        }
        if (!this.error) {
          this.error = 'Erreur de connexion';
        }
        return false;
      } finally {
        this.loading = false;
      }
    },
    setAuthData(token: string, email: string) {
      this.token = token;
      this.userEmail = email;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EMAIL_KEY, email);
      // Décoder expiration pour auto logout
      try {
        const decoded = jwtDecode<DecodedJwt>(token);
        if (decoded.exp) {
          this.tokenExpiry = decoded.exp * 1000;
          this.scheduleAutoLogout();
        } else {
          this.tokenExpiry = null;
        }
      } catch {
        this.tokenExpiry = null;
      }
    },
    scheduleAutoLogout() {
      if (!this.tokenExpiry) return;
      if (this.autoLogoutTimeoutId) {
        clearTimeout(this.autoLogoutTimeoutId);
      }
      const delay = Math.max(1000, this.tokenExpiry - Date.now());
      this.autoLogoutTimeoutId = window.setTimeout(() => {
        this.logout();
      }, delay);
    },
    logout() {
      this.clearAuth();
    },
    clearAuth() {
      this.token = null;
      this.userEmail = null;
      this.tokenExpiry = null;
      this.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(EMAIL_KEY);
      if (this.autoLogoutTimeoutId) {
        clearTimeout(this.autoLogoutTimeoutId);
        this.autoLogoutTimeoutId = null;
      }
    },
    initialize() {
      // Si un token existe déjà (rechargement navigateur), restaurer expiration
      if (this.token && !this.tokenExpiry) {
        try {
          const decoded = jwtDecode<DecodedJwt>(this.token);
          if (decoded.exp) {
            this.tokenExpiry = decoded.exp * 1000;
            this.scheduleAutoLogout();
          }
        } catch {
          // Token invalide -> purge
          this.clearAuth();
        }
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
