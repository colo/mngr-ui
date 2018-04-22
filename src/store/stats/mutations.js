 
 export const timestamp = (state, epoc) => {
   state.timestamps.push(epoc)
 }

 export const loadavg = (state, loadavg) => {
   state.loadavg.push(loadavg)
 }

 export const uptime = (state, loadavg) => {
   state.uptime.push(loadavg)
 }

 export const networkInterfaces = (state, networkInterfaces) => {
   state.networkInterfaces.push(networkInterfaces)
 }

 export const mem = (state, mem) => {
   state.mem.push(mem)
 }

 export const cpu = (state, cpu) => {
   state.cpu.push(cpu)
 }

 export const cpu_simple = (state, cpu_simple) => {
   state.cpu_simple.push(cpu_simple)
 }

 export const splice = (state, payload) => {
   let length = state[payload.stat].length
   state[payload.stat].splice(
     -payload.length -1,
     length - payload.length
   )
 }
