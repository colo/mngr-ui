'use strict'

//import App from '../../node_modules/node-app-cradle-client/index'
// const App = require ( '../../node_modules/node-app-couchdb-client/index' )
const App = require ( 'node-app-couchdb-client/index' )

export default new Class({
  Extends: App,

  paths: /^os\.historical.*/,

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
            // ////console.log('sort_by_path', next)

            // if(app.hosts.length > 0){
            if(app.options.stat_host){

              let end = (req.opt.range.end != null) ?  req.opt.range.end : Date.now()

              Array.each(app.options.paths, function(path){
                // ////console.log('sort_by_path', host)

                // if(!app.hosts_range_started.contains(host)){
                  // app.hosts_range_started.push(host)
                  //////console.log('req.opt.range', req.opt.range, host)

                  // next(
                  app.view({
      							uri: app.options.db,
                    args: [
                      'sort',
                      'by_path',
                      {
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
                  // )

                // }


              }.bind(app))
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
              Array.each(app.options.paths, function(path){
                // next(
                // ////console.log('sort_by_path', host)
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
              // )
              }.bind(app))

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
		//console.log('historical..os -> this.view ', resp, view.options.args);

		if(err){

		}
		else{

        if(view.options.args[2].limit == 1 && resp.rows[0]){
  				this.fireEvent('onPeriodicalDoc', [resp.rows[0].doc, {type: 'periodical', input_type: this, app: null}]);
  			}
        else if(resp.rows.length > 0){//range docs
          //console.log('range docs', resp)
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

    //console.log('input.poller.couchdb.stats.os', options)
		this.parent(options);//override default options

		this.profile('root_init');//start profiling


		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
  },
  connect: function(){

	},


});
