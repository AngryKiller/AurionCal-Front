<script setup lang="ts"></script>

<template>
  <div class="container">
    <div class="q-pt-none q-pa-md">
      <q-list bordered class="rounded-borders">
        <q-expansion-item group="ask" :label="$t('faq.howItWorks.q')" icon="help_outline" expand-separator>
          <q-card>
            <q-card-section class="faq-preline">
              {{ $t('faq.howItWorks.a') }}
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-expansion-item group="ask" :label="$t('faq.security.q')" icon="security" expand-separator>
          <q-card>
            <q-card-section class="faq-preline">
              {{ $t('faq.security.a') }}
            </q-card-section>
          </q-card>
        </q-expansion-item>

        <q-expansion-item group="ask" :label="$t('faq.passwordChanged.q')" icon="password" expand-separator>
          <q-card>
            <q-card-section class="faq-preline">
              {{ $t('faq.passwordChanged.a') }}
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
  margin: 0 auto;
}

.faq-preline {
  white-space: pre-line;
}
</style>
