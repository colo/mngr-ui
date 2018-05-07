'use strict'

import cron from 'node-cron'

import DefaultConn from '../../etc/default.conn'

import InputPollerCouchDBOS from '../input/poller/couchdb.os'

export default {
	input: [
		{
			poll: {
				id: "input.os",
				conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              path_key: 'os',
              module: InputPollerCouchDBOS,
            }
          )
				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				// requests: {
				// 	periodical: 1000,
				// },
				requests: {
    			periodical: function(dispatch){
    				return cron.schedule('* * * * * *', dispatch);//every second
    			}
    		},
			},
		}
	],
	filters: [
		function(doc, opts, next){

      if(doc != null && opts.type == 'periodical' && doc.metadata.path == 'os'){
				console.log('host doc perdiodical', doc)


  			let mem = {
          type: 'mem',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            totalmem: doc.data.totalmem,
            freemem: doc.data.freemem
          },
        }
        // let cpu = { total: 0, idle: 0, timestamp: doc.metadata.timestamp }
        let cpu = {
          type: 'cpu',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.cpus
          }
        }
        // let timestamp = { host: doc.metadata.host, timestamp: doc.metadata.timestamp }
        let uptime = {
          type: 'uptime',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.uptime
          }

        }

        let loadavg = {
          type: 'loadavg',
          host: doc.metadata.host,
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.loadavg
          }
        }

        let networkInterfaces = {
          type: 'networkInterfaces',
          host: doc.metadata.host,
          // data: [{
          //   timestamp: doc.metadata.timestamp,
          //   value: doc.data.networkInterfaces
          // }]
          data: {
            timestamp: doc.metadata.timestamp,
            value: doc.data.networkInterfaces
          }
        }

				next(mem)
				next(cpu)
				// next(timestamp)
				next(uptime)
				next(loadavg)
				next(networkInterfaces)


      }
      else if(doc != null && doc[0] && doc[0].doc.metadata.path == 'os'){//range
        // console.log('range doc', doc)

        let mem = {
          type: 'mem',
          host: doc[0].doc.metadata.host,
          data: [],
        }
        // let cpu = { total: 0, idle: 0, timestamp: doc[0].doc.metadata.timestamp }
        let cpu = {
          type: 'cpu',
          host: doc[0].doc.metadata.host,
          data: []
        }
        // let timestamp = { host: doc[0].doc.metadata.host, timestamp: doc[0].doc.metadata.timestamp }
        let uptime = {
          type: 'uptime',
          host: doc[0].doc.metadata.host,
          data: []

        }

        let loadavg = {
          type: 'loadavg',
          host: doc[0].doc.metadata.host,
          data: []
        }

        let networkInterfaces = {
          type: 'networkInterfaces',
          host: doc[0].doc.metadata.host,
          data: []
        }

        Array.each(doc, function(row){
          mem.data.push({
            timestamp: row.doc.metadata.timestamp,
            totalmem: row.doc.data.totalmem,
            freemem: row.doc.data.freemem
          })
          cpu.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.cpus
          })
          uptime.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.uptime
          })
          loadavg.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.loadavg
          })
          networkInterfaces.data.push({
            timestamp: row.doc.metadata.timestamp,
            value: row.doc.data.networkInterfaces
          })
        })


        next(mem)
				next(cpu)
				// // next(timestamp)
				next(uptime)
				next(loadavg)
				next(networkInterfaces)
      }
      // else if(doc != null){
      //   next(doc)
      // }

		},
	],
	output: [
		function(doc){
      doc = JSON.decode(doc)

      // ////console.log(doc.host)
      let type = doc.type
      EventBus.$emit(type, doc) //update mem widget

		}
	]
}
