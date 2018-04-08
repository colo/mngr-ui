 export const timestamp = (state, epoc) => {
   state.timestamps.push(epoc)
 }

 export const splice = (state, n) => {
   let length = state.timestamps.length
   state.timestamps.splice(
     -n -1,
     length - n
   )
 }
