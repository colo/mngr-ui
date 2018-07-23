export default function() {
  return {
    all: [],
    current: '',

    // ex:
    // modules_blacklist: {
    //   'os': /[\s\S]*/,
    //   'os/blockdevices': /sd.*/
    // },

    modules_blacklist: {
    },

    // ex:
    // modules_whitelist: {
    //   'os': [/freemem/,/totalmem/],
    // },

    modules_whitelist: {
    }
  }
}
