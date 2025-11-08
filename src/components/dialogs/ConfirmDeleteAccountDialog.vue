<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">Supprimer le compte</q-card-section>
      <q-card-section>
        Cette action supprimera votre compte et votre abonnement calendrier. Confirmez-vous ?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Supprimer" color="negative" @click="onDialogOK()" />
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

