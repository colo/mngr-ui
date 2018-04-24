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
          outline
          no-ripple
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn>

        <q-toolbar-title class="gt-sm">
          <!-- Quasar App -->
          <el-select
            v-model="currentHost"
            placeholder="Select"
            size="small"
            :disabled="hosts.length <= 1"
            filterable
            >
            <el-option
              v-for="host in hosts"
              :key="host.value"
              :label="host.label"
              :value="host.value">
            </el-option>
          </el-select>

          <el-date-picker
            size="small"
            v-model="dateRange"
            type="datetimerange"
            :picker-options="DateRangeOptions"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            align="right"
            @change="selectedDateRange"
            >
          </el-date-picker>

          <!-- <div slot="subtitle">
            Running on Quasar v{{ $q.version }}
          </div> -->

        </q-toolbar-title>


      </q-toolbar>



      <q-card class="absolute-top-right" flat inline>
        <q-card-main>

          <!-- <at-button type="text" icon="icon-bell">
            Alarms
            <at-badge :value="123" status="info" :max-num="99"></at-badge>
          </at-button> -->
          <!-- <at-dropdown placement="bottom-left">
            <at-button size="normal" icon="icon-user">User <i class="icon icon-chevron-down"></i></at-button>
            <at-dropdown-menu slot="menu">
              <at-dropdown-item name="settings" divided><i class="icon icon-settings"></i> Settings</at-dropdown-item>
            </at-dropdown-menu>
          </at-dropdown> -->

          <!-- <el-badge :value="200" :max="99" class="item"> -->
          <el-badge is-dot>
            <!-- <el-button size="small">Alarms</el-button> -->
            <el-button icon="el-icon-bell" size="small"></el-button>
          </el-badge>



          <el-dropdown size="small" split-button type="primary">
            <i class="icon icon-user"></i> User
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item><i class="icon icon-settings"></i> Settings</el-dropdown-item>
              <el-dropdown-item divided> More...</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>


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
          <!-- <at-select
            v-model="currentHost"
            filterable
            size="large"
            style="width: 100%"
            :multiple="false"
            :disabled="hosts.length <= 1"
            >

            <template v-for="(host) in hosts">
              <at-option
              :value="host"
              :key="'selectHosts_'+host"
              >
              {{host}}
              </at-option>
            </template>
          </at-select> -->

          <!-- <q-select
            style="width: 100%"
            v-model="currentHost"
            color="primary"
            frame-color="primary"
            class="no-margin"
            inverted
            :disable="hosts.length <= 1"
            :options="hosts"
          /> -->

          <!-- <el-select
            v-model="currentHost"
            placeholder="Select"
            style="width: 100%"
            size="small"
            :disabled="hosts.length <= 1"
            filterable
            >
            <el-option
              v-for="host in hosts"
              :key="host.value"
              :label="host.label"
              :value="host.value">
            </el-option>
          </el-select> -->
        </q-item>




        <!-- filter -->


        <!-- <q-item @click.native="openURL('http://quasar-framework.org')">
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
        </q-item> -->
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
        no-ripple
        flat
      >
        <q-icon name="keyboard_arrow_up"/>
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
import { mapState } from 'vuex'

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
      DateRangeOptions: {
        shortcuts: [
          {
            text: 'Last 5 minutes',
            onClick(picker) {
              // const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 300 * 1000);
              picker.$emit('pick', [start, null]);
            }
          },
          {
            text: 'Last 15 minutes',
            onClick(picker) {
              // const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 900 * 1000);
              picker.$emit('pick', [start, null]);
            }
          },
          // {
          //   text: 'Last hour',
          //   onClick(picker) {
          //     const end = new Date();
          //     const start = new Date();
          //     start.setTime(start.getTime() - 3600 * 1000);
          //     picker.$emit('pick', [start, end]);
          //   }
          // },
          // {
          //   text: 'Last 24Hs',
          //   onClick(picker) {
          //     const end = new Date();
          //     const start = new Date();
          //     start.setTime(start.getTime() - 3600 * 1000 * 24);
          //     picker.$emit('pick', [start, end]);
          //   }
          // },
          // {
          //   text: 'Last week',
          //   onClick(picker) {
          //     const end = new Date();
          //     const start = new Date();
          //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
          //     picker.$emit('pick', [start, end]);
          //   }
          // },
          // {
          //   text: 'Last month',
          //   onClick(picker) {
          //     const end = new Date();
          //     const start = new Date();
          //     start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
          //     picker.$emit('pick', [start, end]);
          //   }
          // }

        ]
      },
      dateRange: ''
      // selectedHost: 'colo',
      // selectHosts: [
      //   {
      //     label: 'localhost',
      //     value: '127.0.0.0.1'
      //   }
      // ]
    }
  },
  // created (){
  //   this.currentHost = 0
  // },
  mounted () {
    // let currentHost = this.currentHost
    // if(this.currentHost == '' && this.hosts.length == 1){
    //   // this.$store.commit('hosts/current', 'colo')
    //   this.currentHost = this.hosts[0]
    // }

  },
  computed: Object.merge(
    {
      currentHost: {
        get () {
          let host = this.$store.state.hosts.current
          //console.log('current host', host);
          if((host == '' || !host) && this.$store.state.hosts.all.length > 0){
            host = this.$store.state.hosts.all[0]
            this.$store.commit('hosts/current', host)
            // host = 0
          }
          // else if (this.hosts.length > 0){
          //   //console.log('current host indexOf', host);
          //   host = this.$store.state.hosts.all.indexOf(host)
          // }
          // else{
          //   host = 0
          // }

          //console.log('current host', host);
          return host
        },
        // setter
        set (value) {
          //console.log('setting host...', value)
          this.$store.commit('hosts/current', value)
        }
      }
    },
    mapState({
      // arrow functions can make the code very succinct!
      // hosts: state => state.hosts.all,
      hosts: function(state){
        let hosts = []
        Array.each(state.hosts.all, function(val, index){
          let host = {
            value: val,
            label: val
          }
          hosts.push(host)
        })

        return hosts
      }

    })
  ),
  methods: {
    // openURL
    selectedDateRange () {
      if(this.dateRange[1] instanceof Date){

        // window.EventBus.$emit('highlightCallback', {})

        this.$store.commit('app/range', {start: this.dateRange[0].getTime(), end: this.dateRange[1].getTime()})
      }
      else{
        this.$store.commit('app/range', {start: this.dateRange[0].getTime(), end: null})
      }
    }
  }
}
</script>

<style>
</style>
