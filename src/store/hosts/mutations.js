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

export const erase = (state, payload) => {
  if(!state.all.contains(payload))
    state.all.erase(host)
}


export const clear = (state) => {
  Vue.set(state, 'all', [])
}
