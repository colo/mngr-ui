 export const reset = (state, bool) => {
  state.reset = bool
 }
 export const suspend = (state, bool) => {
  state.suspend = bool
 }
 export const pause = (state, bool) => {
  state.pause = bool
 }
 export const freeze = (state, bool) => {
  state.freeze = bool
 }

 export const range = (state, payload) => {
   state.range = [payload.start, payload.end]
 }
