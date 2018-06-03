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
    default_chart_icon: 'mdi-pulse',
    icons: {
      'mdi-chart-line': /^os$/,
      'mdi-flash': /cpus.*/,
      'fa-microchip': /^.*mem.*$/,
      'mdi-clock': /minute.*/,
      'mdi-harddisk': /blockdevices.*|mounts.*/,
      'mdi-network': /networkInterfaces.*/
      // 'mdi-pulse': /.*/
    },
  }
}
