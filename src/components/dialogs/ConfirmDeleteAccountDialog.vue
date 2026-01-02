<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">{{ $t('dialogs.deleteAccount.title') }}</q-card-section>
      <q-card-section>
        {{ $t('dialogs.deleteAccount.message') }}
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat :label="$t('common.cancel')" color="primary" @click="onDialogCancel" />
        <q-btn flat :label="$t('common.delete')" color="negative" @click="onDialogOK()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// expose emits for Quasar Dialog plugin integration
defineEmits([...useDialogPluginComponent.emits]);
</script>
