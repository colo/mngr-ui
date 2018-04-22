import Vue from 'vue'
import Vuex from 'vuex'

import hosts from './hosts'
import app from './app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    hosts,
    app
  }
})

// if we want some HMR magic for it, we handle
// the hot update like below. Notice we guard this
// code with "process.env.DEV" -- so this doesn't
// get into our production build (and it shouldn't).
if (process.env.DEV && module.hot) {
  module.hot.accept(['./hosts'], () => {
    const newHosts = require('./hosts').default
    store.hotUpdate({ modules: { hosts: newHosts } })
  })
  module.hot.accept(['./app'], () => {
    const newApp = require('./app').default
    store.hotUpdate({ modules: { app: newApp } })
  })
}

export default store
