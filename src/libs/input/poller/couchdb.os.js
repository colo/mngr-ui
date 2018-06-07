'use strict'

//import App from '../../node_modules/node-app-cradle-client/index'
// const App = require ( '../../node_modules/node-app-couchdb-client/index' )
const App = require ( 'node-app-couchdb-client/index' )


export default new Class({
  Extends: App,

  // host: 'colo',
  // hosts: [],
  // hosts_range_started: [],

  paths: /^os.*/,

  options: {
    paths: [],
    stat_host: null,

    path_key: null,
    path_start_key: null,
    path_end_key: null,


    range: [
      Date.now() - 300000,
      Date.now()
    ],

		requests : {
      range: [
				//{ get: {uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'} },
				{
					sort_by_path: function(req, next, app){
            //////console.log('req.opt.range', req.opt.range)
            // ////////console.log('sort_by_path', next)

            // if(app.hosts.length > 0){
            if(app.options.stat_host){
              // let start_key = (app.options.path_start_key != null) ? app.options.path_start_key: app.options.path_key
              // let end_key = (app.options.path_end_key != null ) ? app.options.path_end_key : app.options.path_key

              let end = (req.opt.range.end != null) ?  req.opt.range.end : Date.now()
              Array.each(app.options.paths, function(path){
                // ////////console.log('sort_by_path', host)

                // if(!app.hosts_range_started.contains(host)){
                  // app.hosts_range_started.push(host)
                  //////////console.log('req.opt.range', req.opt.range, host)

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
        								/**
        								 * pouchdb
        								 * */
        								// startkey: [app.options.path_key, app.host, "periodical\ufff0"],
        								// endkey: [app.options.path_key, app.host, "periodical"],
        								/** **/
        								// limit: 1,
        								// descending: (start_key == end_key) ? false : true,
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
        // {
				// 	search_hosts: function(req, next, app){
        //     ////////console.log('search_hosts', next)
        //
				// 		// next(
        //     app.view({
				// 			uri: 'dashboard',
        //       args: [
        //         'search',
        //         'hosts',
        //         {
        //           //limit: 1,
        //           reduce: true, //avoid geting duplicate host
        //           group: true,
        //           //descending: true,
        //           //inclusive_end: true,
        //           // include_docs: true
  			// 				}
        //       ]
				// 		})
        //     // )
				// 	}
				// },
        // {
        //   search_paths: function(req, next, app){
        //     // ////console.log('search_paths', next)
        //
        //     // next(
        //     app.view({
        //       uri: app.options.db,
        //       args: [
        //         'search',
        //         'paths',
        //         {
        //           //limit: 1,
        //           reduce: true, //avoid geting duplicate host
        //           group: true,
        //
        //         }
        //       ]
        //     })
        //     // )
        //   }
        // },
				{
					sort_by_path: function(req, next, app){
            // ////console.log('sort_by_path', app.paths)
            // ////////console.log('sort_by_path', next)

            // if(app.hosts.length > 0){
            if(app.options.stat_host){
              // let start_key = (app.options.path_start_key != null) ? app.options.path_start_key: app.options.path_key
              // let end_key = (app.options.path_end_key != null ) ? app.options.path_end_key : app.options.path_key

              /**
              * limit for 'os',
              * unlimit for 'munin'
              */

              Array.each(app.options.paths, function(path){
                // next(
                // ////////console.log('sort_by_path', host)
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
      								/**
      								 * pouchdb
      								 * */
      								// startkey: [app.options.path_key, app.host, "periodical\ufff0"],
      								// endkey: [app.options.path_key, app.host, "periodical"],
      								/** **/
                      limit: 1,
      								descending: true,
      								inclusive_end: true,
      								include_docs: true
      							}

                  ]
    						})
              // )
              })
            }

					}
				}
				//{
					//view: function(req, next, app){
						//////////////console.log('---periodical')

							//let cb = next.pass(
								////////////////console.log('---next')
								//app.view({//get doc by host->last.timestamp (descending = true, and reversed star/end keys)
									//uri: 'dashboard',
									//id: 'sort/by_path',
									//data: {
										////startkey: [app.options.path_key, app.host, "periodical",Date.now()],
										////endkey: [app.options.path_key, app.host, "periodical", Date.now() - 2000],
										///**
										 //* pouchdb
										 //* */
										//startkey: [app.options.path_key, app.host, "periodical\ufff0"],
										//endkey: [app.options.path_key, app.host, "periodical"],
										///** **/
										//limit: 1,
										//descending: true,
										//inclusive_end: true,
										//include_docs: true
									//}
								//}).bind(app)
							//);

							//cb.attempt();
					//}
				//}
				//{
					//view: function(req, next, app){//wrap it on a func, so we can call "this", as "app"
						//////////////console.log('---periodical')
						//let cb = next.pass(
							////////////////console.log('---next')
							//app.view({
								//uri: 'dashboard/_design/sort/_view/by_path',
								//headers: {
									//'Accept': 'application/json'
								//},
								//qs: {

										////startkey: [app.options.path_key, this.host, "periodical",Date.now()],
										////endkey: [app.options.path_key, this.host, "periodical", Date.now() - 2000],
										///**
										 //* pouchdb
										 //* */
										//startkey: [app.options.path_key, app.host, "periodical\ufff0"],
										//endkey: [app.options.path_key, app.host, "periodical"],
										///** **/

										//limit: 1,
										////reduce: true, //avoid geting duplicate host
										////group: true,
										//descending: true,
										//inclusive_end: true,
										//include_docs: true

								//}
							//})//app.view
						//)//next

						//cb.attempt();

					//}
				//}
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
  // range_sort_by_path: function(err, resp){
  //   //////////console.log('range_sort_by_path', err, resp)
  // },
  view: function(err, resp, view){
		// //////////console.log('this.view ', resp, view.options.args);

		if(err){
			////////////console.log('this.sort_by_path error %o', err);

		}
		else{
      // if(view.options.args[0] == 'search' && view.options.args[1] == 'paths'){
      //   ////console.log('this.search_path', resp);
      //   let os = /^os.*/
      //   this.paths = []
      //   Array.each(resp.rows, function(path){
      //     if(os.test(path.key) == true)
      //       this.paths.push(path.key)
      //   }.bind(this))
      // }
      // else{
      // if(view.options.args[0] == 'search' && view.options.args[1] == 'hosts'){
      //   this.hosts = []
      //
      //   Array.each(resp.rows, function(row){
      //     // this.fireEvent('onPeriodicalDoc', [row.doc, {type: 'periodical', input_type: this, app: null}]);
      //     this.hosts.push(row.key)
      //
      //     // ////////console.log('this.hosts_range_started', this.hosts_range_started)
      //     // if(!this.hosts_range_started.contains(row.key)){//if no range for this host yet
      //     //   /**
      //     //   * start with range, "last 300000 ms / 5min"
      //     //   */
      //     //   this.fireEvent('range', { Range: 'posix '+ this.options.range[0] +'-'+ this.options.range[1] +'/*' })
      //     //   this.hosts_range_started.push(row.key)
      //     // }
      //
      //   }.bind(this))
      //
      //   this.fireEvent('onPeriodicalDoc', [{ data: {hosts: this.hosts } }, {type: 'periodical', input_type: this, app: null}]);
      // }
      // else{
        if(view.options.args[2].limit == 1 && resp.rows[0]){
  				this.fireEvent('onPeriodicalDoc', [resp.rows[0].doc, {type: 'periodical', input_type: this, app: null}]);
  			}
        else if(resp.rows.length > 0){//range docs
          //////console.log('range docs', resp)
          this.fireEvent('onRangeDoc', [resp.rows, {type: 'range', input_type: this, app: null}]);

          // Array.each(resp.rows, function(row){
          //   this.fireEvent('onPeriodicalDoc', [row.doc, {type: 'periodical', input_type: this, app: null}]);
          // }.bind(this))
        }
      // }
		}
  },
  request: function(err, resp){
		// ////////////console.log('this.info %o', resp);

		//////////////console.log('---INFO RESP---');
		//this.get({uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'});
		//////////////console.log(resp);
		if(err){
			////////////console.log('this.info error %o', err);
			//this.fireEvent(this.ON_CONNECT_ERROR, err);
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
		////console.log('OS this.connect');

		// try{
		// 	//this.os.api.get({uri: 'hostname'});
		// 	//this.get({uri: '/'}, this._first_connect.bind(this));
		// 	this.request(
    //     {
    //       opts: {
    //         path: '/'
    //       }
    //     },
    //     this._first_connect.bind(this)
    //   );
    //
		// }
		// catch(e){
		// 	////////////console.log(e);
		// }
	},
	// _first_connect: function(err, result, body, opts){
	// 	// //////////console.log('first_connect %o', result.uuid);
	// 	this.options.id = 'os-'+result.uuid;//set ID
  //
  //   // this.fireEvent('ON_RANGE', {})
	// }

});
