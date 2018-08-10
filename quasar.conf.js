// Configuration for your app

const CopyWebpackPlugin = require('copy-webpack-plugin')//amchart3 assets

module.exports = function (ctx) {
  return {
    // app plugins (/src/plugins)
    plugins: [
      'i18n',
      'axios',
      // 'atui',
      'element-ui',
      'vue-observe-visibility',
      'AddressbarColor',
      'bootstrap-vue',
      // 'amcharts3',
      // 'vueEcharts3',
      // 'highchartsVue'
    ],
    // css: [
    //   'app.styl'
    // ],
    // extras: [
    //   ctx.theme.mat ? 'roboto-font' : null,
    //   'material-icons',
    //   'ionicons',
    //   'mdi',
    //   'fontawesome'
    // ],
    supportIE: true,
    vendor: {
      add: [],
      remove: []
    },
    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      extendWebpack (cfg) {
        /**
      	 * for npm 'request' (https://github.com/request/request/issues/1529)
      	 * */
        cfg.node = {
          console: true,
          fs: 'empty',
          net: 'empty',
          tls: 'empty',
          //'node-express-authorization': 'empty'
        },
        cfg.plugins.push(
          new CopyWebpackPlugin([{ from: 'node_modules/amcharts3/amcharts/images', to: 'dist/amcharts/images' },])
        )
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QSelect',
        'QCard',
        'QCardMain',
        'QCollapsible',
        'QSpinnerGears',
        'QKnob',
        // 'QTree',
        // 'QBtnDropdown'
        'QPageSticky'
      ],
      directives: [
        // 'Ripple',
        // 'ScrollFire',
        'BackToTop'
      ],
      // Quasar plugins
      plugins: [
        'Notify',
        'Loading'
      ],
      iconSet: 'mdi'
    },
    // animations: 'all' --- includes all animations
    animations: [
    ],
    pwa: {
      cacheExt: 'js,html,css,ttf,eot,otf,woff,woff2,json,svg,gif,jpg,jpeg,png,wav,ogg,webm,flac,aac,mp4,mp3',
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      packager: {
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Window only
        // win32metadata: { ... }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.2'
  }
}
