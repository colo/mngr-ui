<template>
  <q-page class="flex flex-center">
    <img v-if="!$q.platform.is.desktop" alt="Quasar logo" src="~assets/quasar-logo-full.svg">
    <at-rate v-else></at-rate>
  </q-page>
</template>

<style>
</style>

<script>

export default {
  name: 'PageIndex'
}
</script>
