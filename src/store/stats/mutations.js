 import Vue from 'vue'

 export const timestamp = (state, payload) => {
   if(Array.isArray(payload)){
     state.timestamps = payload
   }
   else {
     state.timestamps.push(payload)
   }
 }

 export const loadavg = (state, payload) => {
   if(Array.isArray(payload)){
     state.loadavg = payload
   }
   else {
     state.loadavg.push(payload)
   }
 }

 export const uptime = (state, payload) => {
   if(Array.isArray(payload)){
     state.uptime = payload
   }
   else {
     state.uptime.push(payload)
   }
 }

 export const networkInterfaces = (state, payload) => {
   if(Array.isArray(payload)){
     // state.networkInterfaces = payload
     Vue.set(state, 'networkInterfaces', payload)

     console.log(state.networkInterfaces)
   }
   else {
     state.networkInterfaces.push(payload)
   }
 }

 export const mem = (state, payload) => {
   if(Array.isArray(payload)){
     state.mem = payload
   }
   else {
     state.mem.push(payload)
   }
 }

 export const cpu = (state, payload) => {
   if(Array.isArray(payload)){
     state.cpu = payload
   }
   else {
     state.cpu.push(payload)
   }
 }

 export const cpu_simple = (state, payload) => {
   if(Array.isArray(payload)){
     state.cpu_simple = payload
   }
   else {
     state.cpu_simple.push(payload)
   }
 }

 // export const reset = (state, payload) => {
 //   if(!payload){
 //     Object.each(state, function(value, key){
 //       console.log('reseting state key', key)
 //       if(Array.isArray(value)){
 //         state[key] = []
 //       }
 //       else{
 //         state[key] = {}
 //       }
 //     })
 //   }
 //   else{
 //     if(Array.isArray(state[payload])){
 //       state[payload] = []
 //     }
 //     else{
 //       state[payload] = {}
 //     }
 //   }
 //
 //   console.log('reseting state', state)
 // }

 export const splice = (state, payload) => {
   let length = state[payload.stat].length
   state[payload.stat].splice(
     -payload.length -1,
     length - payload.length
   )
 }
