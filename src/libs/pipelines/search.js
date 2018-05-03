'use strict'

import InputPollerCouchDBHosts from '../input/poller/couchdb.hosts'
import InputPollerCouchDBPaths from '../input/poller/couchdb.paths'

import DefaultConn from '../../etc/default.conn'

export default  {
	input: [
		{
			poll: {
				id: "input.hosts",
				conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              id: 'input.hosts',
              module: InputPollerCouchDBHosts,
            }
          )

				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 1000,
				},
			},
		},
    {
			poll: {
				id: "input.paths",
				conn: [
          Object.merge(
            Object.clone(DefaultConn),
            {
              id: 'input.paths',
              module: InputPollerCouchDBPaths,
            }
          )

				],
				connect_retry_count: 5,
				connect_retry_periodical: 1000,
				requests: {
					periodical: 1000,
				},
			},
		}
	],
	output: [
		function(doc){

			doc = JSON.decode(doc)

      if(doc.data.hosts){

				EventBus.$emit('hosts', doc.data.hosts)

			}
      else{
        // console.log('search_pipeline else', doc)
        EventBus.$emit('paths', doc.data.paths)
      }

		}
	]
}
