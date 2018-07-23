import Vue from 'vue'

export const current = (state, host) => {
  state.current = host
}

export const add = (state, host) => {
  state.all.push(host)
}

export const set = (state, hosts) => {
  Array.each(hosts, function(host){
    if(!state.all.contains(host))
      state.all.push(host)
  })
  Array.each(state.all, function(host){
    if(!hosts.contains(host))
      state.all.erase(host)
  })
  // Vue.set(state, 'all', hosts)
}

export const erase = (state, hosts) => {
  if(state.all.contains(hosts)){
    let tmp_array = Array.clone(state.all)
    tmp_array.erase(host)
    Vue.set(state, all, tmp_array)
  }
}


export const clear = (state) => {
  Vue.set(state, 'all', [])
}

export const clear_modules_blacklist = (state) => {
  Vue.set(state, 'modules_blacklist', {})
}

export const clear_modules_whitelist = (state) => {
  Vue.set(state, 'modules_whitelist', {})
}

export const erase_blacklist_module = (state, path) => {
  // Vue.set(state.modules_blacklist, payload.path, payload.list)
  delete state.modules_blacklist[path]
}

export const erase_whitelist_module = (state, payload) => {
  // Vue.set(state.modules_blacklist, payload.path, payload.list)
  // delete state.modules_blacklist[path]
  if(
    state.modules_whitelist[payload.path]
    && state.modules_whitelist[payload.path].contains(payload.list)
  ){
    let tmp_array = Array.clone(state.modules_whitelist[payload.path])
    tmp_array.erase(payload.list)
    Vue.set(state.modules_whitelist, payload.path, tmp_array)
  }
}

export const blacklist_module = (state, payload) => {
  Vue.set(state.modules_blacklist, payload.path, payload.list)
}

export const whitelist_module = (state, payload) => {
  if(!state.modules_whitelist[payload.path])
    Vue.set(state.modules_whitelist, payload.path, [])

  state.modules_whitelist[payload.path].push(payload.list)
}
