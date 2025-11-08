<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" persistent>
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">Régénérer le lien calendrier</q-card-section>
      <q-card-section>
        Cette action invalide l'ancien lien de votre flux calendrier et en génère un nouveau. Vous devrez mettre à jour vos abonnements externes. Continuer ?
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Confirmer" color="primary" @click="onDialogOK()" />
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

