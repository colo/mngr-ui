'use strict'

// import App from '../../node_modules/node-app-http-client/index'
const App = require ( 'node-app-http-client/index' )

export default new Class({
  Extends: App,

  host: 'colo',

  options: {

		requests : {
			//once: [{
				 //get: {uri: ''}
			//}],
			periodical: [{
				get: function(req, next, app){//wrap it on a func, so we can call "this", as "app"
					next({
						uri: '/dashboard/_design/sort/_view/by_path',
						headers: {
							'Accept': 'application/json'
						},
						qs: {

								//startkey: ["os", app.host, "periodical",Date.now()],
								//endkey: ["os", app.host, "periodical", Date.now() - 2000],
								/**
								 * pouchdb
								 * */
								startkey: ["os", app.host, "periodical\ufff0"],
								endkey: ["os", app.host, "periodical"],
								/** **/

								limit: 1,
								//reduce: true, //avoid geting duplicate host
								//group: true,
								descending: true,
								inclusive_end: true,
								include_docs: true

						}
					})
				}
			}],

		},

		routes: {

			get: [
				{
					path: '/:db/_design/:ddoc/_view/:vname',
					callbacks: ['get_last_periodical'],
					//version: '',
				},
				{
					path: '/',
					callbacks: ['get'],
					//version: '',
				},
			]
		},

		//api: {

			//version: '1.0.0',



		//},
  },

  get_last_periodical: function(err, resp, body){
		console.log('this.get %o', resp);

		if(err){
			console.log('this.get error %o', err);
			//this.fireEvent(this.ON_CONNECT_ERROR, err);
		}
		else{
			let result = JSON.decode(resp.body)

			console.log('this.get result %o', result);

			if(result.rows[0]){
				this.fireEvent('onPeriodicalDoc', [result.rows[0].doc.data, {type: 'periodical', input_type: this, app: null}]);

				//for (var key in result.rows[0].doc.data) {
					//console.log(key);
				//}
			}
		}
  },
  get: function(err, resp, body){
		console.log('this.get %o', body);

		if(err){
			console.log('this.get error %o', err);
			//this.fireEvent(this.ON_CONNECT_ERROR, err);
		}
  },
  //post: function(err, resp, body){
  //},
  /**
   * http://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
   *
   * */
  _flatten_obj: function(data) {
		console.log('_flatten_obj %o', data);

		var result = {};
		function recurse (cur, prop) {
			if (Object(cur) !== cur) {
					result[prop] = cur;
			} else if (Array.isArray(cur)) {
					 for(var i=0, l=cur.length; i<l; i++)
							 recurse(cur[i], prop + "[" + i + "]");
					if (l == 0)
							result[prop] = [];
			} else {
					var isEmpty = true;
					for (var p in cur) {
							isEmpty = false;
							recurse(cur[p], prop ? prop+"."+p : p);
					}
					if (isEmpty && prop)
							result[prop] = {};
			}
		}

		recurse(data, "");
		return result;
	},
	use: function(mount, app){
		console.log('use %o %o', mount, app);

		var id = Object.keys(this._flatten_obj(mount))[0];

		app.options.id = id;

		app.addEvent(app.ON_CONNECT_ERROR, function(err){
			console.log('app.ON_CONNECT_ERROR %o', err);

			this.fireEvent(this.ON_CONNECT_ERROR);
		}.bind(this));

		//throw new Error();
		this.parent(mount, app);
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
			this.get({uri: '/'}, this._first_connect.bind(this));
		}
		catch(e){
			console.log(e);
		}
	},
	_first_connect: function(err, result, body, opts){
		console.log('first_connect %o', JSON.decode(result.body).uuid);
		this.options.id = JSON.decode(result.body).uuid;//set ID

	}

});
