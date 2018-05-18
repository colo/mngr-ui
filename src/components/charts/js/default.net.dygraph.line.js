import DefaultDygraphLine from './default.dygraph.line'

export default Object.merge(Object.clone(DefaultDygraphLine), {
  options: {
    labels: ['Time', 'Kbps Out', 'Kbps In'],
    series: {
      'Kbps Out': {
         color: 'red',
      },
      'Kbps In': {
         color: 'blue',
      }

    },
  }
})
