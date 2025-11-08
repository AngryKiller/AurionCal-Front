<template>
  <div class="page-container">
    <div class="q-pa-md form-wrap" style="max-width: 420px">
      <div class="text-h5 q-mb-md">Mon compte</div>
      <q-separator />
      <q-form class="q-gutter-md q-mt-md">
        <q-input
          filled
          v-model="email"
          label="Adresse mail Junia"
          readonly
        >
          <template #append>
            <q-btn flat round dense icon="content_copy" @click="copy(email)" :disable="!email" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="calendarFeedUrl"
          label="URL du flux calendrier"
          :hint="calendarFeedUrl ? '' : 'Indisponible pour le moment'"
          readonly
        >
          <template #append>
            <q-btn flat round dense icon="content_copy" @click="copy(calendarFeedUrl)" :disable="!calendarFeedUrl" />
          </template>
        </q-input>

        <div class="row q-gutter-sm">
          <q-btn color="primary" label="S'abonner au calendrier" :disable="!calendarFeedUrl" @click="subscribeToCalendar" />
          <q-space />
          <q-btn color="secondary" outline label="Se déconnecter" @click="doLogout" />
        </div>

        <q-separator />

        <div class="row q-gutter-sm">
          <q-btn color="negative" outline label="Supprimer le compte" @click="showDeleteDialog = true" />
        </div>
      </q-form>

      <q-dialog v-model="showDeleteDialog" persistent>
        <q-card>
          <q-card-section class="text-h6">Supprimer le compte</q-card-section>
          <q-card-section>
            Cette action supprimera votre compte et votre abonnement calendrier. Confirmez-vous ?
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Annuler" color="primary" v-close-popup />
            <q-btn flat label="Supprimer" color="negative" @click="confirmDelete" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth-store';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'vue-router';
import { Client, ApiException } from '../api/business';

interface Decoded extends Record<string, unknown> {
  sub?: string;
  userId?: string;
  feedToken?: string;
  calendarToken?: string;
  token?: string;
  email?: string;
}

const $q = useQuasar();
const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const calendarFeedUrl = ref('');
const showDeleteDialog = ref(false);

function copy(text: string) {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => $q.notify({ type: 'positive', message: 'Copié dans le presse-papiers' }))
    .catch(() => $q.notify({ type: 'warning', message: 'Impossible de copier' }));
}

function subscribeToCalendar() {
  if (!calendarFeedUrl.value) return;
  try {
    const u = new URL(calendarFeedUrl.value);
    window.location.href = `webcal://${u.host}${u.pathname}${u.search}`;
  } catch {
    window.open(calendarFeedUrl.value, '_blank');
  }
}

function confirmDelete() {
  showDeleteDialog.value = false;
  $q.notify({ type: 'negative', message: 'Suppression de compte non disponible (côté serveur)' });
}

function doLogout() {
  auth.logout();
  $q.notify({ type: 'info', message: 'Déconnecté' });
  void router.push('/');
}

async function loadProfile() {
  $q.loading.show();
  try {
    const client = new Client(import.meta.env.VITE_API_BASE_URL, {
      fetch: (url: RequestInfo, init?: RequestInit) => {
        const headers = new Headers(init?.headers || {});
        if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`);
        return fetch(url, { ...(init || {}), headers });
      },
    });
    const resp = await client.aurionCalApiEndpointsGetUserProfileEndpoint();
    if (resp?.email) email.value = String(resp.email);
    // Priorité à l'URL calculée côté serveur si fournie
    if (resp?.calendarFeedUrl) {
      calendarFeedUrl.value = resp.calendarFeedUrl;
    } else if (resp?.userId && auth.token) {
      // Fallback: si le serveur ne fournit pas l'URL complète
      const decoded = jwtDecode<Decoded>(auth.token);
      const feedToken = (decoded.feedToken as string) || (decoded.calendarToken as string) || (decoded.token as string) || '';
      if (feedToken) {
        calendarFeedUrl.value = `${import.meta.env.VITE_API_BASE_URL}/api/calendar/${encodeURIComponent(String(resp.userId))}/${encodeURIComponent(feedToken)}.ics`;
      }
    }
    if (!email.value) {
      // Dernier fallback JWT si email manquant
      try {
        const decoded = jwtDecode<Decoded>(auth.token || '');
        if (decoded.email) email.value = String(decoded.email);
      } catch {/* ignore */}
    }
  } catch (e) {
    if (e instanceof ApiException && e.status === 401) {
      void $q.notify({ type: 'negative', message: 'Session expirée. Veuillez vous reconnecter.' });
      auth.logout();
      void router.push('/');
    } else {
      // Fallback décode local si l’API n’est pas prête
      email.value = auth.userEmail || '';
      try {
        const decoded = jwtDecode<Decoded>(auth.token || '');
        const userId = (decoded.userId as string) || (decoded.sub as string) || '';
        const feedToken = (decoded.feedToken as string) || (decoded.calendarToken as string) || (decoded.token as string) || '';
        if (userId && feedToken) {
          calendarFeedUrl.value = `${import.meta.env.VITE_API_BASE_URL}/api/calendar/${encodeURIComponent(userId)}/${encodeURIComponent(feedToken)}.ics`;
        }
        if (!email.value && decoded.email) {
          email.value = String(decoded.email);
        }
      } catch {/* ignore */}
    }
  } finally {
    $q.loading.hide();
  }
}

onMounted(() => {
  void loadProfile();
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}
.form-wrap {
  width: 100%;
  max-width: 420px;
}
</style>
