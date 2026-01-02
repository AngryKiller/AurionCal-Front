<template>
  <q-select
    v-model="selected"
    :options="options"
    emit-value
    map-options
    dense
    outlined
    style="width: 80px; min-width: 80px; margin-right: 20px"
    @update:model-value="setLocale"
  >
    <template #selected-item="scope">
      <span class="lang-flag" aria-hidden="true">{{ scope.opt.flagEmoji }}</span>
    </template>

    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section avatar>
          <span class="lang-flag" aria-hidden="true">{{ scope.opt.flagEmoji }}</span>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LocalStorage } from 'quasar';
import { useI18n } from 'vue-i18n';
import { I18N_STORAGE_KEY, resolveSupportedLocale } from 'src/boot/i18n';
import { manifest } from 'src/i18n';

const { locale } = useI18n({ useScope: 'global' });

type Option = { label: string; value: string; flagEmoji: string };

function isoCountryToFlagEmoji(iso2: string): string {
  const cc = (iso2 || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return '';
  const A = 0x1f1e6;
  const base = 'A'.charCodeAt(0);
  return String.fromCodePoint(A + (cc.charCodeAt(0) - base), A + (cc.charCodeAt(1) - base));
}

const options = computed<Option[]>(() =>
  manifest.map((m) => ({
    label: m.label,
    value: m.code,
    flagEmoji: isoCountryToFlagEmoji(m.flag),
  })),
);

const selected = computed<string>({
  get: () => resolveSupportedLocale(locale.value),
  set: (val) => {
    locale.value = resolveSupportedLocale(val);
  },
});

function setLocale(val: string) {
  const next = resolveSupportedLocale(val);
  locale.value = next;
  LocalStorage.set(I18N_STORAGE_KEY, next);
}
</script>

<style scoped>
.lang-flag {
  font-size: 18px;
  line-height: 1;
}
</style>
