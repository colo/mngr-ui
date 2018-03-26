<template>
  <q-page class="flex flex-center">
    <!--
    <at-rate v-else></at-rate> -->
    <template v-if="!$q.platform.is.desktop">
      <img alt="Quasar logo" src="~assets/quasar-logo-full.svg">
    </template>
    <template v-else>
    <at-collapse simple :value="[0, 1]">
      <at-collapse-item
        v-for="(item, index) in list"
        :key="index"

      >

          <div slot="title">{{item.title}} <i class="icon icon-info"/></div>
          <at-card style="width: 300px;" :bordered="false">
            <h4 slot="title">Card Title</h4>
            <div slot="extra"><a>Extra</a></div>
            <div>
              Card Content
            </div>
          </at-card>
          <!-- {{ item.content }} -->

      </at-collapse-item>
    </at-collapse>
  </template>
  </q-page>
</template>

<style>
</style>

<script>

export default {
  name: 'PageIndex',
  data () {
    return {
      list: [
        {title: 'first chart'},
        {title: 'second chart'},
      ]
    }
  }
}
</script>
