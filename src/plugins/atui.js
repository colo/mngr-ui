// import something here
import AtComponents from 'at-ui'
import 'at-ui-style'    // Import CSS
// import 'at-ui-style/src/index.scss'      // Or import the unbuilt version of SCSS

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // something to do
  Vue.use(AtComponents)
}
