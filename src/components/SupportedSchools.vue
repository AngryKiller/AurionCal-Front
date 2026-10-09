<script setup lang="ts">
import { ref } from 'vue';
import type { AurionCalApiEndpointsSchoolSummary as SchoolSummary } from '../api/business';

defineProps<{ schools: SchoolSummary[] }>();

// Logos live in public/schools/<school id>.png; the school name is shown when one is missing
const missingLogos = ref<Set<string>>(new Set());

function logoUrl(id: string) {
  return `${import.meta.env.BASE_URL}schools/${id}.png`;
}

function onLogoError(id: string) {
  missingLogos.value = new Set(missingLogos.value).add(id);
}
</script>

<template>
  <section v-if="schools.length > 0" class="schools-band q-mt-md q-py-md q-px-lg">
    <div class="schools-band__title text-caption text-uppercase text-grey-7 text-center q-mb-sm">
      {{ $t('schools.title') }}
    </div>
    <div class="schools-band__logos row items-center justify-center">
      <template v-for="school in schools" :key="school.id">
        <img
          v-if="school.id && !missingLogos.has(school.id)"
          class="schools-band__logo"
          :src="logoUrl(school.id)"
          :alt="school.name"
          :title="school.name"
          loading="lazy"
          @error="onLogoError(school.id)"
        />
        <span v-else class="schools-band__name text-weight-bold text-grey-7">{{
          school.name
        }}</span>
      </template>
    </div>
    <p class="schools-band__disclaimer text-caption text-grey-7 text-center q-mt-md q-mb-none">
      {{ $t('schools.disclaimer') }}
    </p>
  </section>
</template>

<style scoped>
.schools-band {
  border-top: 1px solid rgba(128, 128, 128, 0.25);
}

.schools-band__title {
  letter-spacing: 0.08em;
}

.schools-band__disclaimer {
  font-size: 0.7rem;
  line-height: 1.3;
}

.schools-band__logos {
  gap: 16px 40px;
}

.schools-band__logo {
  height: 44px;
  max-width: 140px;
  object-fit: contain;
  /* Logos are muted by default so the band stays discreet; the colors come back on hover */
  filter: grayscale(1);
  opacity: 0.7;
  transition:
    filter 0.2s ease,
    opacity 0.2s ease;
}

.schools-band__logo:hover {
  filter: none;
  opacity: 1;
}

/* Dark logos on a dark background: lighten them without losing the grayscale look */
.body--dark .schools-band__logo {
  background: #fff;
  border-radius: 8px;
  padding: 4px 8px;
}
</style>
