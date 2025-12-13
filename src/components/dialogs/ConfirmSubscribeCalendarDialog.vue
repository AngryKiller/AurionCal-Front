<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card style="max-width: 520px; width: 100%">
      <q-card-section class="text-h6">S'abonner au calendrier</q-card-section>
      <q-card-section>
        <slot>
          Votre application de calendrier va s'ouvrir afin d'ajouter l'abonnement AurionCal. <br>
          Pour une utilisation optimale, configurez la fréquence de synchronisation automatique à 1 heure.
        </slot>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Annuler" color="primary" @click="onDialogCancel" />
        <q-btn flat label="Confirmer" color="primary" icon="event_available" @click="onDialogOK" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
defineEmits([...useDialogPluginComponent.emits]);
</script>

