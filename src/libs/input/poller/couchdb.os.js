'use strict'

const App = require ( 'node-app-couchdb-client/index' )


export default new Class({
  Extends: App,

  paths: /^os.*/,

  options: {
    paths: [],
    stat_host: null,

    path_key: null,
    path_start_key: null,
    path_end_key: null,

    paths_blacklist: /^os\.procs.*/,
    // paths_blacklist: undefined,

    range: [
      Date.now() - 300000,
      Date.now()
    ],

		requests : {
      range: [
				{
					sort_by_path: function(req, next, app){

            if(app.options.stat_host){
              // let start_key = (app.options.path_start_key != null) ? app.options.path_start_key: app.options.path_key
              // let end_key = (app.options.path_end_key != null ) ? app.options.path_end_key : app.options.path_key



              let end = (req.opt.range.end != null) ?  req.opt.range.end : Date.now()

              Array.each(app.options.paths, function(path){
                if(!app.options.paths_blacklist || app.options.paths_blacklist.test( path ) == false){

                  console.log('couchdb.os range', path)

                    // next(
                    app.view({
        							uri: app.options.db,
                      args: [
                        'sort',
                        'by_path',
                        {
          								// startkey: [start_key, app.options.stat_host, "periodical", req.opt.range.start],
          								// endkey: [end_key, app.options.stat_host, "periodical",req.opt.range.end],
                          startkey: [path, app.options.stat_host, "periodical", req.opt.range.start],
          								endkey: [path, app.options.stat_host, "periodical",end],

          								inclusive_end: true,
          								include_docs: true
          							}
                      ]
        						})
                }

              }.bind(app))


            }



					}
				},

			],
			periodical: [

				{
					sort_by_path: function(req, next, app){

            if(app.options.stat_host){
              // let start_key = (app.options.path_start_key != null) ? app.options.path_start_key: app.options.path_key
              // let end_key = (app.options.path_end_key != null ) ? app.options.path_end_key : app.options.path_key

              /**
              * limit for 'os',
              * unlimit for 'munin'
              */

              Array.each(app.options.paths, function(path){

                if(!app.options.paths_blacklist || app.options.paths_blacklist.test( path ) == false){
                  console.log('couchdb.os path', path)

                  app.view({
      							uri: app.options.db,
                    args: [
                      'sort',
                      'by_path',
                      {
        								// startkey: [start_key, app.options.stat_host, "periodical",Date.now() + 0],
        								// endkey: [end_key, app.options.stat_host, "periodical", Date.now() - 1000],
                        startkey: [path, app.options.stat_host, "periodical",Date.now() + 0],
        								endkey: [path, app.options.stat_host, "periodical", Date.now() - 1000],
                        limit: 1,
        								descending: true,
        								inclusive_end: true,
        								include_docs: true
        							}

                    ]
      						})
                }
              })
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
		// //////////console.log('this.view ', resp, view.options.args);

		if(err){
			////////////console.log('this.sort_by_path error %o', err);

		}
		else{


        if(view.options.args[2].limit == 1 && resp.rows[0]){
  				this.fireEvent('onPeriodicalDoc', [resp.rows[0].doc, {type: 'periodical', input_type: this, app: null}]);
  			}
        else if(resp.rows.length > 0){//range docs
          //////console.log('range docs', resp)
          this.fireEvent('onRangeDoc', [resp.rows, {type: 'range', input_type: this, app: null}]);


        }
      // }
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

    //////console.log('input.poller.couchdb.os', options)
		this.parent(options);//override default options

		this.profile('root_init');//start profiling


		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
  },
  connect: function(){

	},


});
