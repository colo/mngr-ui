 export const reset = (state, bool) => {
  state.reset = bool
 }
 export const suspend = (state, bool) => {
  state.suspend = bool
 }

 export const range = (state, payload) => {
   state.range = [payload.start, payload.end]
 }
