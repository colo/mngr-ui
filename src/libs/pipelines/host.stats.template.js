'use strict'

import cron from 'node-cron'

import DefaultConn from '../../etc/default.conn'

import InputPollerCouchDBOSStats from '../input/poller/couchdb.os.stats'

export default {
	input: [
		{
			poll: {
				id: "input.os.stats",
				conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              module: InputPollerCouchDBOSStats,
            }
          )
				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
        /**
        * @dev
        **/
				// requests: {
				// 	periodical: 10000,
				// },
        requests: {
    			periodical: function(dispatch){
    				return cron.schedule('* * * * *', dispatch);//every minute
    			}
    		},
			},
		}
	],
	filters: [
		function(doc, opts, next){

      if(doc != null && opts.type == 'periodical'){
        //console.log('InputPollerCouchDBOSStats->filter periodical', doc)

      //
  		// 	let mem = {
      //     type: 'mem',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       totalmem: doc.data.totalmem,
      //       freemem: doc.data.freemem
      //     },
      //   }
      //   // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
      //   let cpu = {
      //     type: 'cpu',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       value: doc.data.cpus
      //     }
      //   }
      //   // let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
      //   let uptime = {
      //     type: 'uptime',
      //     host: doc.metadata.host,
      //     data: {
      //       timestamp: doc.metadata.timestamp,
      //       value: doc.data.uptime
      //     }
      //
      //   }
      //
        let loadavg = {
          path: 'os.stats',
          messure: doc.metadata.type,
          type: 'loadavg',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            range: doc.metadata.range,
            value: doc.data.loadavg
          }
        }
      //
        // let networkInterfaces = {
        //   path: 'os.stats',
        //   messure: doc.metadata.type,
        //   type: 'loadavg',
        //   host: doc.metadata.host,
        //   data: {
        //     timestamp: doc.metadata.timestamp,
        //     range: doc.metadata.range,
        //     value: doc.data.networkInterfaces
        //   }
        // }
      //
			// 	next(mem)
			// 	next(cpu)
			// 	// next(timestamp)
			// 	next(uptime)
				next(loadavg)
				// next(networkInterfaces)
      //
      //
      }
      else if(doc != null && doc[0]){//range
        //console.log('InputPollerCouchDBOSStats->filter range', doc)
      //   // ////console.log('range doc', doc)
      //
      //   let mem = {
      //     type: 'mem',
      //     host: doc[0].doc.metadata.host,
      //     data: [],
      //   }
      //   // let cpu = { total: 0, idle: 0, timestamp: doc[0].doc.metadata.timestamp }
      //   let cpu = {
      //     type: 'cpu',
      //     host: doc[0].doc.metadata.host,
      //     data: []
      //   }
      //   // let timestamp = { host: doc[0].doc.metadata.host, timestamp: doc[0].doc.metadata.timestamp }
      //   let uptime = {
      //     type: 'uptime',
      //     host: doc[0].doc.metadata.host,
      //     data: []
      //
      //   }
      //
        let loadavg = {
          path: 'os.stats',
          messure: doc[0].doc.metadata.type,
          type: 'loadavg',
          host: doc[0].doc.metadata.host,
          data: []
        }


        // let networkInterfaces = {
        //   path: 'os.stats',
        //   messure: doc[0].doc.metadata.type,
        //   type: 'networkInterfaces',
        //   host: doc[0].doc.metadata.host,
        //   data: []
        // }

        Array.each(doc, function(row){
          // mem.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   totalmem: row.doc.data.totalmem,
          //   freemem: row.doc.data.freemem
          // })
          // cpu.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   value: row.doc.data.cpus
          // })
          // uptime.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   value: row.doc.data.uptime
          // })

          loadavg.data.push({
            timestamp: row.doc.metadata.timestamp,
            range: row.doc.metadata.range,
            value: row.doc.data.loadavg
          })

          // networkInterfaces.data.push({
          //   timestamp: row.doc.metadata.timestamp,
          //   range: row.doc.metadata.range,
          //   value: row.doc.data.networkInterfaces
          // })
        })
      //
      //
      //   next(mem)
			// 	next(cpu)
			// 	// // next(timestamp)
			// 	next(uptime)
				next(loadavg)
				// next(networkInterfaces)
      }


		},
	],
	output: [
		function(doc){
      doc = JSON.decode(doc)

      //console.log('InputPollerCouchDBOSStats->output', doc)
      //
      // // ////console.log(doc.host)
      // let type = doc.type
      EventBus.$emit(doc.path, doc) //update mem widget

		}
	]
}
