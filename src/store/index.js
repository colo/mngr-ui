import Vue from 'vue'
import Vuex from 'vuex'

import hosts from './hosts'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    hosts
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
}

export default store
