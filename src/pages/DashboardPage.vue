<template>
  <div class="page-container">
    <div class="q-pa-md form-wrap">
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

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm">
            <q-btn class="full-width" color="primary" icon="event_available" label="S'abonner au calendrier" :disable="!calendarFeedUrl" @click="subscribeToCalendar" />
          </div>
          <div class="col-12 col-sm">
            <q-btn class="full-width" color="warning" icon="autorenew" label="Regénérer un flux" @click="openResetDialog" />
          </div>
          <div class="col-12 col-sm">
            <q-btn class="full-width" color="secondary" outline icon="logout" label="Se déconnecter" @click="doLogout" />
          </div>
        </div>

        <q-separator />

        <div class="row q-gutter-sm">
          <q-btn color="negative" outline class="full-width" icon="delete_forever" label="Supprimer le compte" @click="openDeleteDialog" />
        </div>
      </q-form>
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
import ConfirmDeleteAccountDialog from 'components/dialogs/ConfirmDeleteAccountDialog.vue';
import ResetCalendarLinkDialog from 'components/dialogs/ResetCalendarLinkDialog.vue';

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
  $q.loading.show();
  void (async () => {
    try {
      const client = createClient();
      await client.aurionCalApiEndpointsDeleteUserEndpoint();
      auth.logout();
      $q.notify({ type: 'positive', message: 'Compte supprimé.' });
      void router.push('/');
    } catch (e) {
      if (e instanceof ApiException && e.status === 401) {
        void $q.notify({ type: 'negative', message: 'Session expirée. Veuillez vous reconnecter.' });
        auth.logout();
        void router.push('/');
      } else {
        $q.notify({ type: 'negative', message: 'Échec de la suppression du compte.' });
      }
    } finally {
      $q.loading.hide();
    }
  })();
}

function doLogout() {
  $q.loading.show();
  auth.logout();
  $q.notify({ type: 'info', message: 'Déconnecté' });
  void router.push('/');
  $q.loading.hide();
}

function authFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`);
  return fetch(url, { ...(init || {}), headers });
}

function createClient() {
  return new Client(import.meta.env.VITE_API_BASE_URL, { fetch: authFetch });
}

async function loadProfile(showLoader = true) {
  if (showLoader) $q.loading.show();
  try {
    const client = createClient();
    const resp = await client.aurionCalApiEndpointsGetUserProfileEndpoint();
    if (resp?.email) email.value = String(resp.email);
    if (resp?.calendarFeedUrl) {
      calendarFeedUrl.value = resp.calendarFeedUrl;
    }
  } catch (e) {
    if (e instanceof ApiException && e.status === 401) {
      void $q.notify({ type: 'negative', message: 'Session expirée. Veuillez vous reconnecter.' });
      auth.logout();
      void router.push('/');
    } else {
      // Fallback local
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
    if (showLoader) $q.loading.hide();
  }
}

async function confirmReset() {
  try {
    $q.loading.show();
    const client = createClient();
    await client.aurionCalApiEndpointsResetCalendarTokenEndpoint();
    await loadProfile(false);
    $q.notify({ type: 'positive', message: 'Lien calendrier regénéré.' });
  } catch (e) {
    if (e instanceof ApiException && e.status === 401) {
      void $q.notify({ type: 'negative', message: 'Session expirée. Veuillez vous reconnecter.' });
      auth.logout();
      void router.push('/');
    } else {
      $q.notify({ type: 'negative', message: 'Échec de la régénération du lien.' });
    }
  } finally {
    $q.loading.hide();
  }
}

function openDeleteDialog() {
  $q.dialog({ component: ConfirmDeleteAccountDialog })
    .onOk(() => {
      confirmDelete();
    });
}

function openResetDialog() {
  $q.dialog({ component: ResetCalendarLinkDialog })
    .onOk(() => {
      void confirmReset();
    });
}

onMounted(() => {
  void loadProfile();
});
</script>

<style scoped>

</style>
