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
        <!-- <q-btn
          flat
          outline
          no-ripple
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
        >
          <q-icon name="menu" />
        </q-btn> -->

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

          <el-button-group>
            <el-button type="primary"
              :disabled="charts_state == 'paused'"
              @click="pause(true); suspend(false)"
            >
              <q-icon name="pause" />
            </el-button>
            <el-button type="primary"
              :disabled="charts_state == 'running'"
              @click="suspend(false); freeze(false); pause(false)"
            >
              <q-icon name="play_arrow" />
            </el-button>
            <el-button type="primary"
              :disabled="charts_state == 'suspended'"
              @click="pause(false); suspend(true)"
            >
              <q-icon name="stop" />
            </el-button>
          </el-button-group>
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

          <q-btn
            flat
            outline
            no-ripple
            aria-label="Menu"
            @click="isCollapse = !isCollapse"
          >
            <!-- @click="rightDrawerOpen = !rightDrawerOpen" -->
            <q-icon name="menu" />
          </q-btn>

        </q-card-main>
      </q-card>

    </q-layout-header>

    <!-- <q-layout-drawer
     side="right"
     :content-style="{width: '40px', padding: '10px'}"
    > -->
    <!-- v-model="rightDrawerOpen" -->
    <!-- :content-style="{width: '220px', padding: '10px'}" -->

    <!-- :content-class="['bg-grey-3', 'q-pa-sm']" -->
      <!-- <q-list
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
      </q-list> -->

      <!-- default-expand-all -->
      <!-- accordion -->
      <!-- <q-tree
        :nodes="menu"
        node-key="id"
        :expanded.sync="menu_props_expanded"
      >
      <div slot="header-anchor" slot-scope="prop" class="row items-center">
        <q-icon v-if="prop.node.icon" :name="prop.node.icon" class="q-tree-arrow q-mr-xs transition-generic" />
        <a :href="'#'+prop.node.id">
          <div class="text-primary">{{ prop.node.label }}</div>
        </a>
      </div>

      <div slot="header-generic" slot-scope="prop" class="row items-center">
        <q-icon v-if="prop.node.icon" :name="prop.node.icon" class="q-tree-arrow q-mr-xs transition-generic" />
        <div class="text-primary">{{ prop.node.label }}</div>
      </div>
      </q-tree> -->
    <!-- </q-layout-drawer> -->

    <q-page-container style="width:85%">
      <router-view :EventBus="EventBus"/>
      <q-btn
        v-back-to-top.animate="{offset: 500, duration: 100}"
        round
        color="primary"
        class="fixed-bottom-right animate-pop justify-center"
        style="margin: 0 200px 15px 0"
        no-ripple
        flat
      >
        <q-icon name="keyboard_arrow_up"/>
      </q-btn>
    </q-page-container>

    <q-page-sticky position="top-right" :offset="[0, 0]">
      <!-- <at-select v-model="selectedHost"
        filterable
        size="normal"
        style="width: 240px"
        v-for="(host) in selectHosts"
        :key="host.value"
        >
        <at-option value="host.value">{{host.label}}</at-option>
      </at-select> -->
      <el-menu
        class="el-menu-vertical"
        :collapse="isCollapse"
        :default-openeds="menu_props_expanded"
        :collapse-transition="false"
        :unique-opened="true"
      >
        <!-- default-active="1" -->
        <el-submenu :index="'#'+submenu.id" :key="submenu.id" v-for="(submenu, index) in menu">

          <template slot="title">
            <q-icon color="primary" size="12pt" :name="submenu.icon"></q-icon>
            <span slot="title">{{submenu.label}}</span>
          </template>


          <!-- 2nd level -->

          <template v-if="submenu.children.length > 0" v-for="(child, child_index) in submenu.children">
          <!-- <span slot="title">Group One</span> -->
            <el-submenu
            v-if="child.children.length > 0"
            :index="'#'+child.id"
            :key="child.id"
            style="padding-left: 10px;"
            >
              <template slot="title">
                <q-icon color="primary" size="12pt" :name="child.icon"></q-icon>
                <span slot="title">{{child.label}}</span>
              </template>

              <!-- 3rd level -->
              <template v-for="(sub_child, sub_child_index) in child.children">
              <!-- <span slot="title">Group One</span> -->
                <el-submenu
                v-if="sub_child.children.length > 0"
                :index="'#'+sub_child.id"
                :key="sub_child.id"
                style="padding-left: 10px;"
                >
                  <template slot="title">
                    <q-icon color="primary" size="12pt" :name="sub_child.icon"></q-icon>
                    <span slot="title">{{sub_child.label}}</span>
                  </template>

                  <!-- 4th level -->
                  <el-menu-item v-for="(last, last_index) in sub_child.children"
                  :index="last.id"
                  :key="last.id"
                  style="padding-left: 10px;"
                  >
                    <!-- @click.native="scrollTo('#'+last.id)" -->
                    <!-- <q-icon size="12pt" :name="last.icon"></q-icon> -->
                    <a :href="'#'+last.id">
                      {{last.label}}
                    </a>
                  </el-menu-item>

                  <!-- /4th level -->
                </el-submenu>

                <el-menu-item
                v-else
                :index="'#'+sub_child.id"
                :key="sub_child.id"
                style="padding-left: 10px;"
                >
                  <!-- @click.native="scrollTo('#'+sub_child.id)" -->
                  <!-- <q-icon size="12pt" :name="sub_child.icon"></q-icon> -->
                  <a :href="'#'+sub_child.id">
                    {{sub_child.label}}
                  </a>
                </el-menu-item>
              </template>
              <!-- /3rd level -->

            </el-submenu>

            <el-menu-item
            v-else
            :index="child.id"
            :key="child.id"
            style="padding-left: 10px;"
            >
            <!-- @click.native="scrollTo('#'+child.id)" -->
            <!-- @click="$router.push('#'+child.id)" -->
              <!-- <q-icon size="12pt" :name="child.icon"></q-icon> -->
              <a :href="'#'+child.id">
                {{child.label}}
              </a>
            </el-menu-item>
          </template>

          <!-- /2nd level -->
        </el-submenu>

      </el-menu>


    </q-page-sticky>



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
      isCollapse: false,
      menu_props_expanded: [],
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
          {
            text: 'Last hour',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000);
              picker.$emit('pick', [start, end]);
            }
          },
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

    // From testing, without a brief timeout, it won't work.
    // if (this.$route.hash) {
    //   setTimeout(() => this.scrollTo(this.$route.hash), 1000)
    // }
  },
  // watch: {
  //   '$store.state.app.charts_tree_menu': function(val){
  //     let expand = function(menu){
  //       let expanded = []
  //       if(Array.isArray(menu)){
  //         Array.each(menu, function(sub){
  //           expanded.push(sub.id)
  //           expanded = Array.combine(expand(sub.children), expanded)
  //         })
  //       }
  //       return expanded
  //     }
  //
  //     // let expanded_menu = expand(val)
  //     // console.log('menu_props_expanded get', expanded_menu)
  //     this.$set(this, 'menu_props_expanded', expand(val))
  //   }
  // },
  computed: Object.merge(
    {
      // menu_props_expanded: {
      //   get () {
      //     let expand = function(menu){
      //       let expanded = []
      //       if(Array.isArray(menu)){
      //         Array.each(menu, function(sub){
      //           expanded.push(sub.id)
      //           expanded = Array.combine(expand(sub.children), expanded)
      //         })
      //       }
      //       return expanded
      //     }
      //
      //     let expanded_menu = expand(this.$store.state.app.charts_tree_menu)
      //     console.log('menu_props_expanded get', this.$store.state.app.charts_tree_menu)
      //
      //     return expanded_menu
      //   },
      //   set (value){
      //     console.log('menu_props_expanded set', value)
      //   }
      // },
      // menu_props_expanded: {
      //   get () {
      //     let expand = function(menu){
      //       let expanded = []
      //       if(Array.isArray(menu)){
      //         Array.each(menu, function(sub){
      //           expanded.push(sub.id)
      //           /**
      //           * recursive: expand all
      //           **/
      //           // expanded = Array.combine(expand(sub.children), expanded)
      //
      //           Array.each(sub.children, function(child){
      //             // if(child.children.length == 0)
      //               expanded.push(child.id)
      //           })
      //
      //         })
      //       }
      //       return expanded
      //     }
      //
      //     let expanded_menu = expand(this.$store.state.app.charts_tree_menu)
      //     console.log('menu_props_expanded get', expanded_menu)
      //
      //     return expanded_menu
      //   },
      //   set (value){
      //     console.log('menu_props_expanded set', value)
      //   }
      // },
      currentHost: {
        get () {
          let host = this.$store.state.hosts.current
          //////console.log('current host', host);
          if((host == '' || !host) && this.$store.state.hosts.all.length > 0){
            host = this.$store.state.hosts.all[0]
            this.$store.commit('hosts/current', host)
            // host = 0
          }
          // else if (this.hosts.length > 0){
          //   //////console.log('current host indexOf', host);
          //   host = this.$store.state.hosts.all.indexOf(host)
          // }
          // else{
          //   host = 0
          // }

          //////console.log('current host', host);
          return host
        },
        // setter
        set (value) {
          console.log('setting host...', value)
          this.$store.commit('hosts/current', value)
        }
      }
    },
    mapState({
      menu: state => state.app.charts_tree_menu,
      charts_state: function(state){
        let value = 'running'
        if(state.app.suspend == true){
          value = 'suspended'
        }
        else if(state.app.pause == true){
          value = 'paused'
        }

        return value
      },
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
    scrollTo: function (hashtag) {
      setTimeout(() => { location.href = hashtag }, 1000)
    },
    pause (bool) {
      this.$store.commit('app/pause', bool)
    },
    suspend (bool) {
      this.$store.commit('app/suspend', bool)
    },
    freeze (bool) {
      this.$store.commit('app/freeze', bool)
    },
    // openURL
    selectedDateRange () {
      //console.log('selectedDateRange', this.dateRange)
      if(this.dateRange[1] instanceof Date){

        // EventBus.$emit('highlightCallback', {})
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
  .el-menu-vertical:not(.el-menu--collapse) {
    width: 160px;
    height:100vh;
    min-height:100vh;
    /* height: 100%; */
    /* min-height: 400px; */
  }
  .el-submenu__title {
    font-size: 12px;
    height: 35px;
    line-height: 35px;
    /* padding-left: 20px; */
  }
  .el-submenu__title[style] {
    padding-left: 0px !important;
  }
  .el-submenu .el-menu-item {
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    /* padding-left: 20px; */
  }
  .el-menu--vertical .el-menu-item {
    font-size: 12px;
    height: 25px;
    line-height: 25px;
    /* padding-left: 20px; */
  }
  /* .el-menu-vertical a {
    text-decoration: none !important;
  } */
  .el-menu-vertical a:link {
    display:block;
    text-decoration: inherit;
    color: inherit;
    cursor: inherit;
  }
  .el-menu-vertical a:visited {
    display:block;
    text-decoration: inherit;
    color: inherit;
    cursor: inherit;
  }

  .el-menu--vertical a:link {
    display:block;
    text-decoration: inherit;
    color: inherit;
    cursor: inherit;
  }
  .el-menu--vertical a:visited {
    display:block;
    text-decoration: inherit;
    color: inherit;
    cursor: inherit;
  }

  /* a.el-menu-vertical-demo {
    color:red;
    text-decoration: none;
  } */
</style>
