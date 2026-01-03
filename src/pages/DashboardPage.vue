<template>
  <div class="page-container">
    <div class="q-pa-md form-wrap">
      <div class="text-h5 q-mb-md">{{ $t('dashboard.title') }}</div>
      <q-separator />
      <q-form class="q-gutter-md q-mt-md">
        <q-input filled v-model="email" :label="$t('dashboard.emailLabel')" readonly>
          <template #append>
            <q-btn flat round dense icon="content_copy" @click="copy(email)" :disable="!email" />
          </template>
        </q-input>

        <q-input
          filled
          v-model="calendarFeedUrl"
          :label="$t('dashboard.calendarUrlLabel')"
          :hint="calendarFeedUrl ? '' : $t('dashboard.calendarUrlUnavailable')"
          readonly
        >
          <template #append>
            <q-btn
              flat
              round
              dense
              icon="content_copy"
              @click="copy(calendarFeedUrl)"
              :disable="!calendarFeedUrl"
            />
          </template>
        </q-input>

        <div class="text-caption text-grey-7 q-mt-xs" v-if="lastUpdatedData">
          {{ $t('dashboard.lastUpdated') }} :
          <q-badge outline :color="lastUpdatedData.color" :label="lastUpdatedData.label" />
        </div>

        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm">
            <q-btn
              class="full-width"
              color="primary"
              icon="event_available"
              :label="$t('dashboard.subscribe')"
              :disable="!calendarFeedUrl"
              @click="openSubscribeDialog"
            />
          </div>
          <div class="col-12 col-sm">
            <q-btn
              class="full-width"
              color="warning"
              icon="autorenew"
              :label="$t('dashboard.resetFeed')"
              @click="openResetDialog"
            />
          </div>
          <div class="col-12 col-sm">
            <q-btn
              class="full-width"
              color="secondary"
              outline
              icon="logout"
              :label="$t('dashboard.logout')"
              @click="doLogout"
            />
          </div>
        </div>

        <q-separator />

        <div class="row q-gutter-sm">
          <q-btn
            color="negative"
            outline
            class="full-width"
            icon="delete_forever"
            :label="$t('dashboard.deleteAccount')"
            @click="openDeleteDialog"
          />
        </div>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth-store';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'vue-router';
import { Client, ApiException } from '../api/business';
import ConfirmDeleteAccountDialog from 'components/dialogs/ConfirmDeleteAccountDialog.vue';
import ResetCalendarLinkDialog from 'components/dialogs/ResetCalendarLinkDialog.vue';
import ConfirmSubscribeCalendarDialog from 'components/dialogs/ConfirmSubscribeCalendarDialog.vue';
import config from 'src/config';
import { useI18n } from 'vue-i18n';

type LastUpdatedColor = 'secondary' | 'warning';

interface LastUpdatedData {
  color: LastUpdatedColor;
  label: string;
}

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
const { t, locale } = useI18n({ useScope: 'global' });

const email = ref('');
const calendarFeedUrl = ref('');
const lastUpdatedAt = ref<Date | null>(null);

const lastUpdatedData = computed<LastUpdatedData>(() => {
  if (!lastUpdatedAt.value) {
    return {
      color: 'warning',
      label: t('dashboard.never'),
    };
  }

  let label: string;
  try {
    label = new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(lastUpdatedAt.value);
  } catch {
    label = lastUpdatedAt.value.toLocaleString();
  }

  return {
    color: 'secondary',
    label,
  };
});

function copy(text: string) {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => $q.notify({ type: 'positive', message: t('dashboard.notifyCopied') }))
    .catch(() => $q.notify({ type: 'warning', message: t('dashboard.notifyCopyFailed') }));
}

function subscribeToCalendar() {
  if (!calendarFeedUrl.value) return;
  try {
    const u = new URL(calendarFeedUrl.value);
    if (isAndroid()) {
      // Android needs custom Google Calendar link
      const webcal = encodeURIComponent(`webcal://${u.host}${u.pathname}${u.search}`);
      window.location.href = `https://calendar.google.com/calendar/r?cid=${webcal}`;
      return;
    } else window.location.href = `webcal://${u.host}${u.pathname}${u.search}`;
  } catch {
    window.open(calendarFeedUrl.value, '_blank');
  }
}

function isAndroid() {
  return /Android/i.test(navigator.userAgent || '');
}

function openSubscribeDialog() {
  if (!calendarFeedUrl.value) return;
  $q.dialog({ component: ConfirmSubscribeCalendarDialog }).onOk(() => {
    subscribeToCalendar();
  });
}

function confirmDelete() {
  $q.loading.show();
  void (async () => {
    try {
      const client = createClient();
      await client.aurionCalApiEndpointsDeleteUserEndpoint();
      auth.logout();
      $q.notify({ type: 'positive', message: t('dashboard.notifyAccountDeleted') });
      void router.push('/');
    } catch (e) {
      if (e instanceof ApiException && e.status === 401) {
        void $q.notify({
          type: 'negative',
          message: t('dashboard.notifySessionExpired'),
        });
        auth.logout();
        void router.push('/');
      } else {
        $q.notify({ type: 'negative', message: t('dashboard.notifyDeleteFailed') });
      }
    } finally {
      $q.loading.hide();
    }
  })();
}

function doLogout() {
  $q.loading.show();
  auth.logout();
  $q.notify({ type: 'info', message: t('dashboard.notifyLoggedOut') });
  void router.push('/');
  $q.loading.hide();
}

function authFetch(url: RequestInfo, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  if (auth.token) headers.set('Authorization', `Bearer ${auth.token}`);
  return fetch(url, { ...(init || {}), headers });
}

function createClient() {
  return new Client(config.API_BASE_URL, { fetch: authFetch });
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
    if (resp?.lastUpdated) {
      lastUpdatedAt.value = new Date(resp.lastUpdated);
    }
  } catch (e) {
    if (e instanceof ApiException && e.status === 401) {
      void $q.notify({ type: 'negative', message: t('dashboard.notifySessionExpired') });
      auth.logout();
      void router.push('/');
    } else {
      // Fallback local
      email.value = auth.userEmail || '';
      try {
        const decoded = jwtDecode<Decoded>(auth.token || '');
        const userId = (decoded.userId as string) || (decoded.sub as string) || '';
        const feedToken =
          (decoded.feedToken as string) ||
          (decoded.calendarToken as string) ||
          (decoded.token as string) ||
          '';
        if (userId && feedToken) {
          calendarFeedUrl.value = `${config.API_BASE_URL}/api/calendar/${encodeURIComponent(userId)}/${encodeURIComponent(feedToken)}.ics`;
        }
        if (!email.value && decoded.email) {
          email.value = String(decoded.email);
        }
      } catch {
        /* ignore */
      }
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
    $q.notify({ type: 'positive', message: t('dashboard.notifyLinkRegenerated') });
  } catch (e) {
    if (e instanceof ApiException && e.status === 401) {
      void $q.notify({ type: 'negative', message: t('dashboard.notifySessionExpired') });
      auth.logout();
      void router.push('/');
    } else {
      $q.notify({ type: 'negative', message: t('dashboard.notifyRegenerateFailed') });
    }
  } finally {
    $q.loading.hide();
  }
}

function openDeleteDialog() {
  $q.dialog({ component: ConfirmDeleteAccountDialog }).onOk(() => {
    confirmDelete();
  });
}

function openResetDialog() {
  $q.dialog({ component: ResetCalendarLinkDialog }).onOk(() => {
    void confirmReset();
  });
}

onMounted(() => {
  void loadProfile();
});
</script>

<style scoped></style>
