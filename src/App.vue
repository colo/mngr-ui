<template>
  <div id="q-app">
    <router-view :class="($q.loading.active) ? 'invisible' : 'visible'"  />
  </div>
</template>

<script>
export default {
  name: 'App',
  beforeCreate () {
    this.$q.loading.show({
      delay: 0, // ms
      spinner: 'QSpinnerGears',
      spinnerColor: 'blue',
      customClass : 'bg-white'
    })
  },
}
</script>

<style>
</style>
