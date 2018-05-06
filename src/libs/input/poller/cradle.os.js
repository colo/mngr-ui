'use strict'

//import App from '../../node_modules/node-app-cradle-client/index'
// const App = require ( '../../node_modules/node-app-cradle-client/index' )
const App = require ( 'node-app-cradle-client/index' )

//var console.log = require('console.log')('InputPollerCradleOS');
//var console.log = require('console.log')('InputPollerCradleOS:Internals');
//var console.log = require('console.log')('InputPollerCradleOS:Events');

export default new Class({
  Extends: App,

  host: 'colo',

  options: {

		requests : {

			periodical: [
				//{
					//some: function(req, next, app){
						//next(app.view({
							//uri: 'dashboard',
							//id: 'sort/by_path',
							//data: {
								////startkey: ["os", app.host, "periodical",Date.now()],
								////endkey: ["os", app.host, "periodical", Date.now() - 2000],
								///**
								 //* pouchdb
								 //* */
								//startkey: ["os", app.host, "periodical\ufff0"],
								//endkey: ["os", app.host, "periodical"],
								///** **/
								//limit: 1,
								//descending: true,
								//inclusive_end: true,
								//include_docs: true
							//}
						//}))
					//}
				//}
				//{
					//view: function(req, next, app){
						//console.log('---periodical')

							//let cb = next.pass(
								////console.log('---next')
								//app.view({//get doc by host->last.timestamp (descending = true, and reversed star/end keys)
									//uri: 'dashboard',
									//id: 'sort/by_path',
									//data: {
										////startkey: ["os", app.host, "periodical",Date.now()],
										////endkey: ["os", app.host, "periodical", Date.now() - 2000],
										///**
										 //* pouchdb
										 //* */
										//startkey: ["os", app.host, "periodical\ufff0"],
										//endkey: ["os", app.host, "periodical"],
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
						//console.log('---periodical')
						//let cb = next.pass(
							////console.log('---next')
							//app.view({
								//uri: 'dashboard/_design/sort/_view/by_path',
								//headers: {
									//'Accept': 'application/json'
								//},
								//qs: {

										////startkey: ["os", this.host, "periodical",Date.now()],
										////endkey: ["os", this.host, "periodical", Date.now() - 2000],
										///**
										 //* pouchdb
										 //* */
										//startkey: ["os", app.host, "periodical\ufff0"],
										//endkey: ["os", app.host, "periodical"],
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
			exists: [
				{
					path: ':database',
					callbacks: ['exists'],
				}
			],
			info: [
				{
					path: '',
					callbacks: ['info'],
				}
			],
			view: [
				{
					path: ':database',
					callbacks: ['search'],
					//version: '',
				},
			]
		},


  },

  search: function(err, resp, body){
		console.log('this.search %o', resp);

		if(err){
			console.log('this.search error %o', err);

		}
		else{
			//let result = JSON.decode(resp.body)

			//console.log('this.get result %o', result);

			//if(result.rows[0]){
				//this.fireEvent('onPeriodicalDoc', [result.rows[0].doc.data, {type: 'periodical', input_type: this, app: null}]);

				////for (var key in result.rows[0].doc.data) {
					////console.log(key);
				////}
			//}
		}
  },
  info: function(err, resp){
		console.log('this.info %o', resp);

		//console.log('---INFO RESP---');
		//this.get({uri: 'dashboard/cache', doc: 'localhost.colo.os.blockdevices@1515636560970'});
		//console.log(resp);
		if(err){
			console.log('this.info error %o', err);
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
		console.log('this.connect');

		try{
			//this.os.api.get({uri: 'hostname'});
			//this.get({uri: '/'}, this._first_connect.bind(this));
			this.info({},this._first_connect.bind(this));

			let exists = function(err, resp){
				console.log('exists', err);
				console.log('exists', resp);
			};

			this.exists({ uri: this.options.db}, exists.bind(exists));

			this.view({
				uri: this.options.db,
				id: 'sort/by_path',
			}, function(err, resp){
				console.log('view', err);
				console.log('view', resp);
			})
		}
		catch(e){
			console.log(e);
		}
	},
	_first_connect: function(err, result, body, opts){
		console.log('first_connect %o', result.uuid);
		this.options.id = result.uuid;//set ID

	}

});
