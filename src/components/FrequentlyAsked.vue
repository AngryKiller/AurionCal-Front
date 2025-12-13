<script setup lang="ts"></script>

<template>
  <div class="container">
    <div class="q-pt-none q-pa-md">
      <q-list bordered class="rounded-borders">
        <q-expansion-item
          group="ask"
          label="Comment ça fonctionne ?"
          icon="help_outline"
          expand-separator
        >
          <q-card>
            <q-card-section>
              AurionCal vous permet de synchroniser votre emploi du temps Aurion à votre calendrier
              Apple, Google, etc... <br />
              Vos événements sont mis à jour automatiquement afin de répercuter les modifications
              sur Aurion (toutes les 1h environ). Pour cela il vous suffit de créer un compte à
              l'aide de vos identifiants Junia, puis de vous abonner au flux calendrier généré. <br />
              AurionCal n'est aucunement affilié à Junia.
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          group="ask"
          label="Le service est-il sécurisé ?"
          icon="security"
          expand-separator
        >
          <q-card>
            <q-card-section>
                Afin de pouvoir joindre Aurion et récupérer vos données, AurionCal utilise vos
                identifiants Junia. <br/>
                Ceux-ci sont stockés de manière chiffrée avec une clé privée stockée sur un service
                externe. <br />
                Le code source de AurionCal est ouvert et disponible sur la plateforme GitHub. <br />
            </q-card-section>
          </q-card>
        </q-expansion-item>
        <q-expansion-item
          group="ask"
          label="J'ai changé mon mot de passe Aurion, que faire ?"
          icon="password"
          expand-separator
        >
          <q-card>
            <q-card-section> Fonctionnalité en développement. </q-card-section>
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
</style>
