<template>
  <div class="page-container">
    <div class="q-pa-md form-wrap">
      <q-tabs v-model="activeTab" class="text-primary" dense align="justify">
        <q-tab name="login" :label="$t('auth.loginTab')" icon="login" />
        <q-tab name="register" :label="$t('auth.registerTab')" icon="person_add" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="login">
          <q-form ref="loginFormRef" class="q-gutter-md" @submit.prevent="login">
            <q-input
              filled
              v-model="email"
              :rules="loginEmailRules"
              :label="$t('auth.email')"
              lazy-rules
            />

            <q-input
              filled
              :type="showLoginPwd ? 'text' : 'password'"
              v-model="password"
              :label="$t('auth.password')"
              lazy-rules
              :rules="[]"
            >
              <template #append>
                <q-icon
                  :name="showLoginPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showLoginPwd = !showLoginPwd"
                />
              </template>
            </q-input>

            <div class="row items-center q-gutter-sm">
              <q-btn :loading="auth.loading" icon="login" :label="$t('auth.login')" type="submit" color="primary" />
            </div>
          </q-form>
        </q-tab-panel>
        <q-tab-panel name="register">
          <q-form ref="registerFormRef" class="q-gutter-md" @submit.prevent="register">
            <q-select
              v-if="schools.length > 1"
              filled
              v-model="selectedSchoolId"
              :options="schools"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              :label="$t('auth.school')"
              @update:model-value="registerFormRef?.resetValidation()"
            />
            <q-input
              filled
              v-model="regEmail"
              :rules="registerEmailRules"
              :label="$t('auth.email')"
              :hint="registerEmailHint"
              lazy-rules
            />
            <q-input
              filled
              :type="showRegPwd ? 'text' : 'password'"
              v-model="regPassword"
              :label="$t('auth.password')"
              lazy-rules
              :rules="[]"
            >
              <template #append>
                <q-icon
                  :name="showRegPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showRegPwd = !showRegPwd"
                />
              </template>
            </q-input>

            <div class="row items-center q-gutter-sm">
              <q-btn :loading="registerLoading" icon="person_add_alt" :label="$t('auth.register')" type="submit" color="secondary" />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';
import { Client, ApiException } from '../api/business';
import type { AurionCalApiEndpointsSchoolSummary as SchoolSummary } from '../api/business';
import type { QForm } from 'quasar';
import RegistrationSuccessDialog from 'components/dialogs/RegistrationSuccessDialog.vue';
import config from 'src/config';

const { t } = useI18n({ useScope: 'global' });

const activeTab = ref<'login' | 'register'>('login');

// Login form
const email = ref<string>('');
const password = ref<string>('');

// Register form
const regEmail = ref<string>('');
const regPassword = ref<string>('');
const registerLoading = ref(false);
const registerError = ref<string | null>(null);
const showLoginPwd = ref(false);
const showRegPwd = ref(false);

const $q = useQuasar();
const auth = useAuthStore();
const router = useRouter();

const loginFormRef = ref<QForm | null>(null);
const registerFormRef = ref<QForm | null>(null);

// Schools offered at sign-up (loaded from the API)
const schools = ref<SchoolSummary[]>([]);
const selectedSchoolId = ref<string | null>(null);

const selectedSchool = computed(() => schools.value.find((s) => s.id === selectedSchoolId.value));

// "*.school.edu" accepts subdomains of school.edu
function emailMatchesDomains(value: string, domains: string[]): boolean {
  const at = value.lastIndexOf('@');
  if (at < 0) return false;
  const domain = value.slice(at + 1).trim().toLowerCase();
  return domains.some((d) => {
    const pattern = d.toLowerCase();
    return pattern.startsWith('*.') ? domain.endsWith(pattern.slice(1)) : domain === pattern;
  });
}

function domainsLabel(domains: string[]): string {
  return domains.map((d) => `@${d}`).join(', ');
}

// Domain rules are skipped when the schools could not be loaded: the API validates them anyway
function buildEmailRules(domains: string[]) {
  return [
    (val: string) => !!val || t('auth.emailRequired'),
    (val: string) =>
      domains.length === 0 || emailMatchesDomains(val ?? '', domains) || t('auth.emailDomain', { domains: domainsLabel(domains) }),
  ];
}

const registerDomains = computed(() => selectedSchool.value?.emailDomains ?? []);
// The school is not known at login (it is found from the email), so any school's domain is accepted
const allDomains = computed(() => schools.value.flatMap((s) => s.emailDomains ?? []));

const registerEmailRules = computed(() => buildEmailRules(registerDomains.value));
const loginEmailRules = computed(() => buildEmailRules(allDomains.value));
const registerEmailHint = computed(() =>
  registerDomains.value.length > 0 ? registerDomains.value.map((d) => `...@${d.replace(/^\*\./, '')}`).join(' / ') : ''
);

onMounted(async () => {
  try {
    const resp = await new Client(config.API_BASE_URL).aurionCalApiEndpointsGetSchoolsEndpoint();
    schools.value = resp?.schools ?? [];
    selectedSchoolId.value = resp?.defaultSchoolId ?? schools.value[0]?.id ?? null;
  } catch {
    // Without the list, the API falls back on its default school
    schools.value = [];
  }
});

async function login() {
  email.value = email.value.trim();
  const valid = await loginFormRef.value?.validate();
  if (valid === false) {
    $q.notify({ type: 'negative', message: t('auth.fixFormErrors') });
    return;
  }
  try {
    $q.loading.show();
    const success = await auth.login(email.value, password.value);
    if (success) {
      $q.notify({ type: 'positive', message: t('auth.loginSuccess', { email: auth.userEmail }) });
      await router.push('/dashboard');
    } else {
      $q.notify({ type: 'negative', message: auth.error || t('auth.invalidCredentials') });
    }
  } catch {
    $q.notify({ type: 'negative', message: auth.error || t('auth.loginError') });
  } finally {
    $q.loading.hide();
  }
}

async function register() {
  regEmail.value = regEmail.value.trim();
  const valid = await registerFormRef.value?.validate();
  if (valid === false) {
    registerError.value = t('auth.fixFormErrors');
    return;
  }
  registerLoading.value = true;
  try {
    const client = new Client(config.API_BASE_URL);
    const response = await client.aurionCalApiEndpointsRegisterUserEndpoint({
      email: regEmail.value,
      password: regPassword.value,
      schoolId: selectedSchoolId.value ?? undefined,
    });
    if (response?.userId) {
      email.value = regEmail.value;
      password.value = regPassword.value;
      $q.dialog({ component: RegistrationSuccessDialog }).onOk(() => {
        activeTab.value = 'login';
        $q.notify({ type: 'info', message: t('auth.loginNow') });
      });
    } else {
      registerError.value = t('auth.registerError');
    }
  } catch (e: unknown) {
    if (e instanceof ApiException && e.status === 401) {
      $q.notify({ type: 'negative', message: t('auth.aurionWrongCredentials') });
      registerError.value = t('auth.aurionWrongCredentials');
    } else if (e instanceof ApiException && e.status === 400 && e.result?.errors?.email?.includes('EMAIL_DOMAIN_NOT_ALLOWED')) {
      const message = t('auth.emailDomain', { domains: domainsLabel(registerDomains.value) });
      $q.notify({ type: 'negative', message });
      registerError.value = message;
    } else if (e instanceof ApiException && e.status === 409) {
      $q.notify({ type: 'negative', message: t('auth.emailAlreadyExists') });
      registerError.value = t('auth.emailAlreadyExists');
    } else {
      registerError.value = t('auth.registerError');
    }
  } finally {
    registerLoading.value = false;
  }
}
</script>

<style scoped>

</style>
