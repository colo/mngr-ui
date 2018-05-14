export default {
  "blkdev_stats": {
    match: /blockdevices\..*/,
    watch: {
      value: 'stats',
      /**
      * @trasnform: diff between each value against its prev one
      */
      transform: function(values){
        // console.log('transform: ', values)
        let transformed = []
        let prev = null
        Array.each(values, function(val, index){
          let transform = {timestamp: val.timestamp, value: { stats: {} } }
          transformed.push()
          if(index == 0){
            Object.each(val.value.stats, function(stat, key){
                transform.value.stats[key] = 0
            })
          }
          else{
            Object.each(val.value.stats, function(stat, key){
              let value = ((stat - prev.value.stats[key]) > 0) ? stat - prev.value.stats[key] : 0
              transform.value.stats[key] = value
            })
          }
          prev = val
          transformed.push(transform)
        })
        return transformed
      }
    }

  }
}
