<template>
  <q-page class="flex"> <!-- flex-center -->
    <!-- <div class="overflow-hidden"> -->
    <div class="row">

      <!-- <div class="col-4 order-last"> -->
        <!-- <q-card flat inline> -->

        <!-- </q-card> -->
        <!-- <q-layout-drawer
           v-model="rightDrawerOpen"
           side="right"
        >

        </q-layout-drawer> -->

      <!-- </div> -->

    <!-- <div class="col-12"> -->
    <!-- <q-card flat > -->
      <!--
      <at-rate v-else></at-rate> -->

      <!-- <template v-if="!$q.platform.is.desktop">
        <img alt="Quasar logo" src="~assets/quasar-logo-full.svg" >
      </template>
      <template v-else> -->

        <div class="col-18 window-width">
          <at-collapse simple :value="[0, 1]">
            <!-- class="absolute-top" -->
            <at-collapse-item
              v-for="(item, index) in list"
              :key="index"

            >

                <div slot="title">{{item.title}} <i class="icon icon-info"/></div>
                <at-card :bordered="false">
                  <h4 slot="title">Card Title</h4>
                  <div slot="extra"><a>Extra</a></div>
                  <div>
                    Card Content
                  </div>
                </at-card>
                <!-- {{ item.content }} -->

            </at-collapse-item>
          </at-collapse>
        </div>

        <div class="col-4 no-wrap">
          <at-menu mode="inline" active-name="0">
          <at-menu-item name="0" disabled><i class="icon icon-box"></i>Submenu</at-menu-item>
          <at-submenu>
            <template slot="title"><i class="icon icon-home"></i>Navigation One</template>
            <at-menu-item-group title="Group One">
              <at-menu-item name="1-1">Submenu One</at-menu-item>
              <at-menu-item name="1-2">Submenu Two</at-menu-item>
            </at-menu-item-group>
            <at-menu-item-group title="Group Two">
              <at-menu-item name="1-3">Submenu Three</at-menu-item>
              <at-menu-item name="1-4">Submenu Four</at-menu-item>
            </at-menu-item-group>
          </at-submenu>
          <at-submenu>
            <template slot="title"><i class="icon icon-life-buoy"></i>Navigation Two</template>
            <at-menu-item name="2-1">Submenu One</at-menu-item>
            <at-menu-item name="2-2">Submenu Two</at-menu-item>
            <at-menu-item name="2-3" disabled>Submenu Three</at-menu-item>
            <at-menu-item name="2-4">Submenu Four</at-menu-item>
          </at-submenu>
          <at-submenu>
            <template slot="title"><i class="icon icon-command"></i>Navigation Three</template>
            <at-menu-item name="3-1">Submenu One</at-menu-item>
            <at-menu-item name="3-2">Submenu Two</at-menu-item>
            <at-menu-item name="3-3">Submenu Three</at-menu-item>
            <at-menu-item name="3-4">Submenu Four</at-menu-item>
          </at-submenu>
          <at-submenu disabled>
            <template slot="title"><i class="icon icon-inbox"></i>Navigation Four</template>
            <at-menu-item name="4-1">Submenu One</at-menu-item>
            <at-menu-item name="4-2">Submenu Two</at-menu-item>
          </at-submenu>
        </at-menu>
      </div>

    <!-- </template> -->


  <!-- </q-card> -->
  <!-- </div> -->


  </div>
  <!-- </div> -->
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
