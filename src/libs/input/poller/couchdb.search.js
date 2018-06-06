'use strict'

// const App = require ( '../../node_modules/node-app-couchdb-client/index' )
const App = require ( 'node-app-couchdb-client/index' )


export default new Class({
  Extends: App,

  // hosts: [],
  // hosts_range_started: [],


  options: {

    // range: [
    //   Date.now() - 300000,
    //   Date.now()
    // ],

		requests : {
      once: [
        {
					search_hosts: function(req, next, app){
            ////console.log('search_hosts', next)

						// next(
            app.view({
							uri: app.options.db,
              args: [
                'search',
                'hosts',
                {
                  //limit: 1,
                  reduce: true, //avoid geting duplicate host
                  group: true,

  							}
              ]
						})
            // )
					}
				},
        {
					search_paths: function(req, next, app){
            ////console.log('search_hosts', next)

						// next(
            app.view({
							uri: app.options.db,
              args: [
                'search',
                'paths',
                {
                  //limit: 1,
                  reduce: true, //avoid geting duplicate host
                  group: true,

  							}
              ]
						})
            // )
					}
				},

			],
			periodical: [
        {
					search_hosts: function(req, next, app){
            ////console.log('search_hosts', next)

						// next(
            app.view({
							uri: app.options.db,
              args: [
                'search',
                'hosts',
                {
                  //limit: 1,
                  reduce: true, //avoid geting duplicate host
                  group: true,

  							}
              ]
						})
            // )
					}
				},
        {
					search_paths: function(req, next, app){
            ////console.log('search_hosts', next)

						// next(
            app.view({
							uri: app.options.db,
              args: [
                'search',
                'paths',
                {
                  //limit: 1,
                  reduce: true, //avoid geting duplicate host
                  group: true,

  							}
              ]
						})
            // )
					}
				},

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
		// //console.log('search.view ', resp, view.options);

		if(err){
			////////console.log('this.sort_by_path error %o', err);

		}
		else{
      let data = {}
      if(view.options.args[1] == 'hosts'){
        let hosts = []

        Array.each(resp.rows, function(row){
          // this.fireEvent('onPeriodicalDoc', [row.doc, {type: 'periodical', input_type: this, app: null}]);
          hosts.push(row.key)
        })

        data = { hosts: hosts }
      }
      else{
        let paths = []

        Array.each(resp.rows, function(row){
          // this.fireEvent('onPeriodicalDoc', [row.doc, {type: 'periodical', input_type: this, app: null}]);
          paths.push(row.key)
        })

        data = { paths: paths }
      }

      //console.log('search onPeriodicalDoc', data);
      this.fireEvent('onPeriodicalDoc', [{ data: data }, {type: 'periodical', input_type: this, app: null}]);
		}
  },
  request: function(err, resp){
		if(err){
			////////console.log('this.info error %o', err);
			//this.fireEvent(this.ON_CONNECT_ERROR, err);
		}
	},
  initialize: function(options){
		this.parent(options);//override default options

		this.profile('root_init');//start profiling


		this.profile('root_init');//end profiling

		this.log('root', 'info', 'root started');
  },
  connect: function(){
		// // ////////console.log('this.connect');
    //
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
		// 	////////console.log(e);
		// }
	},
	_first_connect: function(err, result, body, opts){
		// // //////console.log('first_connect %o', result.uuid);
		// this.options.id = 'hosts-'+result.uuid;//set ID
    //
    // // this.fireEvent('ON_RANGE', {})
	}

});
