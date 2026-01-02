<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">{{ $t('dialogs.subscribeCalendar.title') }}</q-card-section>
      <q-card-section>
        <slot>
          {{ $t('dialogs.subscribeCalendar.message') }}
        </slot>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="primary" @click="onDialogCancel" />
        <q-btn
          flat
          :label="$t('common.confirm')"
          color="primary"
          icon="event_available"
          @click="onDialogOK"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);
</script>
