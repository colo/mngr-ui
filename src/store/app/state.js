export default function() {
  return {
    paths: [],
    /**
    *
    **/
    reset: false,
    suspend: false,
    pause: false,
    freeze: false,
    /**
    *
    **/
    range: [
      Date.now() - 300 * 1000,
      null
    ],
    charts_tree_menu: [],
    icons: {
      'flash_on': /cpus.*/
    },
  }
}
