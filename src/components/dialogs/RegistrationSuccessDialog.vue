<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">Inscription terminée</q-card-section>
      <q-card-section>
        Inscription terminée, identifiez-vous afin d'accéder à votre abonnement calendrier.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="OK" color="primary" @click="onDialogOK()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
// expose emits for Quasar Dialog plugin integration
defineEmits([...useDialogPluginComponent.emits]);
</script>
