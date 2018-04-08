<template>
  <q-layout view="hHh Lpr lFf">
    <q-layout-header>
      <q-toolbar
        :inverted="true"
        class="top-left"
      >
      <!-- color="primary" -->
      <!-- :glossy="$q.theme === 'mat'"
      :inverted="$q.theme === 'ios'" -->
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title class="gt-sm">
          Quasar App
          <div slot="subtitle">Running on Quasar v{{ $q.version }}</div>
        </q-toolbar-title>

        <!-- Single Selection as a simple List -->
        <!-- <q-select
          color="none"
          v-model="selectedHost"
          style="width: 240px"
          :options="selectHosts"
        /> -->

      </q-toolbar>



      <q-card class="absolute-top-right" flat inline>
        <q-card-main>
          <at-button type="text" icon="icon-bell">
            Alarms
            <at-badge :value="123" status="info" :max-num="99"></at-badge>
          </at-button>


          <at-dropdown placement="bottom-left">
            <at-button size="normal" icon="icon-user">User <i class="icon icon-chevron-down"></i></at-button>
            <at-dropdown-menu slot="menu">
              <at-dropdown-item name="settings" divided><i class="icon icon-settings"></i> Settings</at-dropdown-item>
            </at-dropdown-menu>
          </at-dropdown>
        </q-card-main>
      </q-card>

    </q-layout-header>

    <!-- <q-layout-drawer
       v-model="rightDrawerOpen"
       side="right"
    >
      <q-list
        no-border
        link
        inset-delimiter
      >
        <q-item>
          <at-select v-model="selectedHost"
            filterable
            size="large"
            style="width: 240px"
            v-for="(host) in selectHosts"
            :key="host.value"
            >
            <at-option value="host.value">{{host.label}}</at-option>
          </at-select>

        </q-item>
        <q-item @click.native="openURL('http://quasar-framework.org')">
          <q-item-side icon="school" />
          <q-item-main label="Docs" sublabel="quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://github.com/quasarframework/')">
          <q-item-side icon="code" />
          <q-item-main label="GitHub" sublabel="github.com/quasarframework" />
        </q-item>
        <q-item @click.native="openURL('https://discord.gg/5TDhbDg')">
          <q-item-side icon="chat" />
          <q-item-main label="Discord Chat Channel" sublabel="https://discord.gg/5TDhbDg" />
        </q-item>
        <q-item @click.native="openURL('http://forum.quasar-framework.org')">
          <q-item-side icon="record_voice_over" />
          <q-item-main label="Forum" sublabel="forum.quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://twitter.com/quasarframework')">
          <q-item-side icon="rss feed" />
          <q-item-main label="Twitter" sublabel="@quasarframework" />
        </q-item>
      </q-list>
    </q-layout-drawer> -->

    <q-layout-drawer
       v-model="leftDrawerOpen"
       :overlay="true"
    >
          <!-- :content-class="$q.theme === 'mat' ? 'bg-grey-2' : null" -->
      <q-list
        no-border
        link
        inset-delimiter
      >
        <!-- <q-list-header>Essential Links</q-list-header> -->
        <q-item>
          <at-select v-model="selectedHost"
            filterable
            size="large"
            style="width: 100%"
            v-for="(host) in selectHosts"
            :key="'selectHosts_'+host.value"
            >
            <at-option value="host">{{host}}</at-option>
          </at-select>

        </q-item>
        <q-item @click.native="openURL('http://quasar-framework.org')">
          <q-item-side icon="school" />
          <q-item-main label="Docs" sublabel="quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://github.com/quasarframework/')">
          <q-item-side icon="code" />
          <q-item-main label="GitHub" sublabel="github.com/quasarframework" />
        </q-item>
        <q-item @click.native="openURL('https://discord.gg/5TDhbDg')">
          <q-item-side icon="chat" />
          <q-item-main label="Discord Chat Channel" sublabel="https://discord.gg/5TDhbDg" />
        </q-item>
        <q-item @click.native="openURL('http://forum.quasar-framework.org')">
          <q-item-side icon="record_voice_over" />
          <q-item-main label="Forum" sublabel="forum.quasar-framework.org" />
        </q-item>
        <q-item @click.native="openURL('https://twitter.com/quasarframework')">
          <q-item-side icon="rss feed" />
          <q-item-main label="Twitter" sublabel="@quasarframework" />
        </q-item>
      </q-list>
    </q-layout-drawer>


    <q-page-container>
      <router-view :EventBus="EventBus"/>
      <q-btn
        v-back-to-top.animate="{offset: 500, duration: 200}"
        round
        color="primary"
        class="fixed-bottom-right animate-pop justify-center"
        style="margin: 0 15px 15px 0"
      >
        <q-icon name="keyboard_arrow_up" />
      </q-btn>
    </q-page-container>


    <!-- <q-page-sticky position="top-right" :offset="[18, 18]">
      <at-select v-model="selectedHost"
        filterable
        size="normal"
        style="width: 240px"
        v-for="(host) in selectHosts"
        :key="host.value"
        >
        <at-option value="host.value">{{host.label}}</at-option>
      </at-select>
    </q-page-sticky> -->

  </q-layout>
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'LayoutDefault',
  props: {
    EventBus: {
      type: [Object],
       default: () => ({})
    },
  },
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      rightDrawerOpen: this.$q.platform.is.desktop,
      selectedHost: 'colo',
      // selectHosts: [
      //   {
      //     label: 'localhost',
      //     value: '127.0.0.0.1'
      //   }
      // ]
    }
  },
  computed: {
    selectHosts: {

      get () {
        let select = []
        Array.each(this.$store.state.hosts.all, function(host, index){
          select.push(host)
        })
        console.log(select)
        return select
      },
      // set (val) {
      //   this.$store.commit('showcase/updateDrawerState', val)
      // }
    }
  },
  methods: {
    openURL
  }
}
</script>

<style>
</style>
