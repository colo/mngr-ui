'use strict'

//import App from '../../node_modules/node-app-cradle-client/index'
// const App = require ( '../../node_modules/node-app-couchdb-client/index' )
const App = require ( 'node-app-couchdb-client/index' )

export default new Class({
  Extends: App,

  paths: /^historical\.os.*/,

  options: {
    paths: [],

    stat_host: null,

    range: [
      Date.now() - 300000,
      Date.now()
    ],

		requests : {
      range: [
				//{ get: {uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'} },
				{
					sort_by_type: function(req, next, app){
            // //console.log('req.opt.range', req.opt.range)
            // console.log('sort_by_type', next)

            // if(app.hosts.length > 0){
            if(app.options.stat_host){

              // let start = (req.opt.range.start != null) ?  req.opt.range.start : Date.now() - 300000
              let end = (req.opt.range.end != null) ?  req.opt.range.end : Date.now()

              let views = []

              Array.each(app.options.paths, function(path){
                // ////console.log('sort_by_path', host)

                // if(!app.hosts_range_started.contains(host)){
                  // app.hosts_range_started.push(host)
                  //////console.log('req.opt.range', req.opt.range, host)

                  console.log('input.poller.couchdb.stats.os range path', path, new Date(Date.now()).toString())

                  // next(
                  // let cb = app.view.pass({
                  app.view({
      							uri: app.options.db,
                    args: [
                      'sort',
                      'by_path',
                      {
        								// startkey: [path, app.options.stat_host, "minute", start],
                        startkey: [path, app.options.stat_host, "minute", req.opt.range.start],
        								endkey: [path, app.options.stat_host, "minute",end],
        								/**
        								 * pouchdb
        								 * */
        								// startkey: ["os", app.host, "periodical\ufff0"],
        								// endkey: ["os", app.host, "periodical"],
        								/** **/
        								// limit: 1,
        								// descending: true,
        								inclusive_end: true,
        								include_docs: true
        							}
                    ]
      						})


                  // views.push(cb);
                  // )

                // }


              }.bind(app))

              // Array.each(views, function(view){
              //   console.log('input.poller.couchdb.stats.os view', view, new Date(Date.now()).toString())
              //
  						// 	view.attempt();
  						// });

            }



					}
				},

			],
			periodical: [

				{
					sort_by_path: function(req, next, app){
            // ////console.log('sort_by_path', app.hosts)
            // ////console.log('sort_by_path', next)

            // if(app.hosts.length > 0){
            if(app.options.stat_host){

              let views = []

              Array.each(app.options.paths, function(path){

                console.log('input.poller.couchdb.stats.os periodical path', path, new Date(Date.now()).toString())

                // let cb = app.view.pass({
                app.view({
    							uri: app.options.db,
                  args: [
                    'sort',
                    'by_path',
                    {
      								startkey: [path, app.options.stat_host, "minute",Date.now() + 0],
      								endkey: [path, app.options.stat_host, "minute", Date.now() - 59000],
      								/**
      								 * pouchdb
      								 * */
      								// startkey: ["os", app.host, "periodical\ufff0"],
      								// endkey: ["os", app.host, "periodical"],
      								/** **/
      								limit: 1,
      								descending: true,
      								inclusive_end: true,
      								include_docs: true
      							}
                  ]
    						})

                // views.push(cb);

              }.bind(app))

              // Array.each(views, function(view){
  						// 	view.attempt();
  						// });

            }

					}
				}

			],

		},

		routes: {
			/**
      exists: [
				{
					path: ':database',
					callbacks: ['exists'],
				}
			],
      **/
			request: [
				{
					path: '',
					callbacks: ['request'],
				}
			],
			view: [
				{
					path: ':database',
					callbacks: ['view'],
					//version: '',
				},
			]
		},


  },

  view: function(err, resp, view){
		// console.log('historical..os -> this.view ', resp, view.options.args);

		if(err){

		}
		else{

        if(view.options.args[2].limit == 1 && resp.rows[0]){
          console.log('input.poller.couchdb.stats.os periodical RESP', resp.rows[0], new Date(Date.now()).toString())

  				this.fireEvent('onPeriodicalDoc', [resp.rows[0].doc, {type: 'periodical', input_type: this, app: null}]);
  			}
        else if(resp.rows.length > 0){//range docs
          console.log('input.poller.couchdb.stats.os range RESP', resp.rows, new Date(Date.now()).toString())

          this.fireEvent('onRangeDoc', [resp.rows, {type: 'range', input_type: this, app: null}]);

        }

		}
  },
  request: function(err, resp){

		if(err){
		}
	},
  initialize: function(options){
    let paths = []
    Array.each(options.paths, function(path){
      if(this.paths.test(path) == true)
        paths.push(path)
    }.bind(this))

    options.paths = paths

    console.log('input.poller.couchdb.stats.os', options.paths, Date.now())

		this.parent(options);//override default options

		this.profile('root_init');//start profiling


		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
  },
  connect: function(){

	},


});
