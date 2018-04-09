 export const timestamp = (state, epoc) => {
   state.timestamps.push(epoc)
 }

 export const loadavg = (state, loadavg) => {
   state.loadavgs.push(loadavg)
 }

 export const uptime = (state, loadavg) => {
   state.uptimes.push(loadavg)
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

 export const splice = (state, n) => {
   let length = state.timestamps.length
   state.timestamps.splice(
     -n -1,
     length - n
   )
 }
