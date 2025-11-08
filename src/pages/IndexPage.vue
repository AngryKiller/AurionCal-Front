<template>
  <div class="page-container">
    <div class="q-pa-md form-wrap">
      <q-tabs v-model="activeTab" class="text-primary" dense align="justify">
        <q-tab name="login" label="J'ai déjà un compte" icon="login" />
        <q-tab name="register" label="Créer un compte" icon="person_add" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="activeTab" animated>
        <q-tab-panel name="login">
          <q-form ref="loginFormRef" class="q-gutter-md" @submit.prevent="login">
            <q-input
              filled
              v-model="email"
              :rules="emailRules"
              label="Adresse mail Aurion"
              hint="...@student.junia.com"
              lazy-rules
            />

            <q-input
              filled
              :type="showLoginPwd ? 'text' : 'password'"
              v-model="password"
              label="Mot de passe"
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
              <q-btn :loading="auth.loading" label="Se connecter" type="submit" color="primary" />
            </div>
            <q-banner v-if="auth.error" class="bg-red text-white" dense>{{ auth.error }}</q-banner>
          </q-form>
        </q-tab-panel>
        <q-tab-panel name="register">
          <q-form ref="registerFormRef" class="q-gutter-md" @submit.prevent="register">
            <q-input
              filled
              v-model="regEmail"
              :rules="emailRules"
              label="Adresse mail Aurion"
              hint="...@student.junia.com"
              lazy-rules
            />
            <q-input
              filled
              :type="showRegPwd ? 'text' : 'password'"
              v-model="regPassword"
              label="Mot de passe"
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
              <q-btn :loading="registerLoading" label="S'inscrire" type="submit" color="secondary" />
            </div>
            <q-banner v-if="registerError" class="bg-red text-white" dense>{{ registerError }}</q-banner>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';
import { Client, ApiException } from '../api/business';
import type { QForm } from 'quasar';
import RegistrationSuccessDialog from 'components/dialogs/RegistrationSuccessDialog.vue';

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

const emailRules = [
  (val: string) => !!val || 'Email requis',
  (val: string) => val?.toLowerCase().endsWith('@student.junia.com') || 'Email doit se terminer par @student.junia.com',
];

async function login() {
  email.value = email.value.trim();
  const valid = await loginFormRef.value?.validate();
  if (valid === false) {
    $q.notify({ type: 'negative', message: 'Veuillez corriger les erreurs du formulaire.' });
    return;
  }
  try {
    $q.loading.show();
    const success = await auth.login(email.value, password.value);
    if (success) {
      $q.notify({ type: 'positive', message: `Connexion réussie (${auth.userEmail})` });
      await router.push('/dashboard');
    } else {
      $q.notify({ type: 'negative', message: auth.error || 'Identifiants invalides' });
    }
  } catch {
    $q.notify({ type: 'negative', message: auth.error || 'Erreur de connexion' });
  } finally {
    $q.loading.hide();
  }
}

async function register() {
  regEmail.value = regEmail.value.trim();
  const valid = await registerFormRef.value?.validate();
  if (valid === false) {
    registerError.value = 'Veuillez corriger les erreurs du formulaire.';
    return;
  }
  registerLoading.value = true;
  try {
    const client = new Client(import.meta.env.VITE_API_BASE_URL);
    const response = await client.aurionCalApiEndpointsRegisterUserEndpoint({ email: regEmail.value, password: regPassword.value });
    if (response?.userId) {
      email.value = regEmail.value;
      password.value = regPassword.value;
      $q.dialog({ component: RegistrationSuccessDialog }).onOk(() => {
        activeTab.value = 'login';
        $q.notify({ type: 'info', message: 'Identifiez-vous maintenant.' });
      });
    } else {
      registerError.value = 'Erreur lors de l\'inscription.';
    }
  } catch (e: unknown) {
    if (e instanceof ApiException && e.status === 401) {
      $q.notify({ type: 'negative', message: 'Identifiants Aurion incorrects' });
      registerError.value = 'Identifiants Aurion incorrects';
    } else {
      registerError.value = 'Erreur lors de l\'inscription.';
    }
  } finally {
    registerLoading.value = false;
  }
}
</script>

<style scoped>
.page-container {
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.form-wrap {
  width: 100%;
  max-width: 820px;
}
</style>
