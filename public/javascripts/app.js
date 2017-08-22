var app = angular.module('app', ['ngRoute', 'ngResource', 'angularMoment', 'angularUtils.directives.dirPagination', 'angular-notification-icons', 'ngAnimate'])
	.run(function ($rootScope, $http) {
		$rootScope.authenticated = false;
		$rootScope.current_user = '';
		$rootScope.store_name = '';
	});

app.config(function ($routeProvider, $locationProvider, $httpProvider) {
	$locationProvider.hashPrefix('');
	$httpProvider.defaults.withCredentials = true;
	$routeProvider
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'authController'
		})
		.when('/jobs', {
			controller: 'jobsController',
			templateUrl: 'views/jobs.html',
		})
		.when('/categories/add', {
			controller: 'CategoriesController',
			templateUrl: 'addCategory.html'
		})
		.when('/', {
			controller: 'productsController',
			templateUrl: 'views/products.html',
		})
		.when('/user/settings/:id', {
			controller: 'usersController',
			templateUrl: 'views/preferences.html',
		})
		.when('/stores', {
			controller: 'storeController',
			templateUrl: 'views/stores.html'
		})
		.when('/stores/add', {
			controller: 'storeController',
			templateUrl: 'views/addStore.html'
		})
		.when('/stores/:id', {
			controller: 'storeController',
			templateUrl: 'views/store-info.html'
		})
		.when('/stores/edit/:id', {
			controller: 'storeController',
			templateUrl: 'views/edit-store.html'
		})
		.when('/orders', {
			controller: 'ordersController',
			templateUrl: 'views/orders.html'
		})
		.when('/basket', {
			templateUrl: 'views/basket.html',
			controller: 'cartController'
		})
		.when('/signup', {
			templateUrl: 'views/register.html',
			controller: 'authController'
		})
		.when('/signout', {
			controller: 'authController'
		})
		.when('/products/add', {
			templateUrl: 'views/addProduct.html',
			controller: 'productsController'
		})
		.when('/products', {
			templateUrl: 'views/products.html',
			controller: 'productsController'
		})
		.when('/products/:id', {
			templateUrl: 'views/product-details.html',
			controller: 'productsController'
		})
		.when('/products/category/:id', {
			templateUrl: 'views/products.html',
			controller: 'productsController'
		})
		.when('/products/edit/:id', {
			templateUrl: 'views/edit-product.html',
			controller: 'productsController'
		})
		.otherwise({
			redirectTo: '/'
		})
});

//Factories
app.factory('productsService', function ($resource) {
	return $resource('/api/products/:id');
});

app.factory('dealsService', function ($resource) {
	return $resource('/api/deals/:id');
});

app.factory('storesService', function ($resource) {
	return $resource('/api/stores/:id');
});

app.factory('ordersService', function ($resource) {
	return $resource('/api/orders/:id');
});

app.factory('usersService', function ($resource) {
	return $resource('/api/users/:id');
});


//Controllers
app.controller('authController', ['$scope', '$http', '$location',
	function ($scope, $http, $location) {
		$scope.user = {};
		$scope.authToken = '';
		$scope.error_message = '';

		//sign in a registered user
		$scope.login = function () {
			let credentials = JSON.stringify($scope.user);
			let headers = new Headers({ 'Content-Type': 'application/json' });
			return new Promise(resolve => {
				$http.post('/auth/login', credentials, { headers: headers })
					.then(data => {
						console.log(data);
						if (data.data.success) {
							localStorage.setItem('authentication_token', data.data.token);
							$scope.auth_token = data.data.token;
							console.log(data.data.token);
							$scope.getUserInfo();
							resolve(true);
						}
						else {
							resolve(false);
						}
					});
			});
		};

		$scope.getUserInfo = function () {
			return new Promise(resolve => {
				console.log('token ' + $scope.auth_token);

				$http({
					method: 'GET',
					url: '/auth/getinfo',
					headers: { 'Authorization': 'Bearer ' + localStorage.getItem('authentication_token') }
				}).then(res => {
					console.log(data);
					if (res.data.success) {
						$rootScope.authenticated = true;
						$rootScope.current_user = res.data.name;
						resolve(res.data);
					}
					else {
						resolve(false);
					}
				});
			});
		}

		//log out the current user
		$scope.signout = function () {
			localStorage.removeItem('authentication_token');
		};

		//register a new user
		$scope.register = function () {
			var user = {
				username: 'tini',
				fullname: 'Martin Gitehi',
				role: 'admin',
				contact: {
					email: 'mg@app-it.com',
					mobile: '0707912063'
				},
				password: '12345'
			}

			console.log(user);

			$http.post('/auth/signup', user).then(function (response) {
				if (response.state == 'success') {
					$rootScope.authenticated = true;
					$rootScope.current_user = response.user.fullname;
					$location.path('/products');
				} else {
					$scope.error_message = response.data.message;
				}
			});
		};
	}
]);

app.controller('CategoriesController', ['$scope', '$http', '$location', '$routeParams', '$rootScope',
	function ($scope, $http, $location, $routeParams, $rootScope) {
		$scope.categories = [];
		$scope.getCategories = function () {
			$http.get('/api/categories').then(function (response) {
				$scope.categories = response.data;
			});
		}
	}
]);

app.controller('ordersController', ['$scope', '$http', '$location', '$routeParams', 'ordersService',
	function ($scope, $http, $location, $routeParams, ordersService) {
		$scope.orders = [];
		$scope.total = 0;
		$scope.getOrders = function () {
			$http.get('/api/orders').then(function (response) {
				console.log(response);
				$scope.orders = response.data;
				angular.forEach($scope.orders, function (order) {
					$scope.total += order.cart.totalPrice;
				});
				console.log($scope.total);
				return $scope.total;
			});
		};
	}
]);

app.controller('storeController', ['$scope', '$http', '$location', '$routeParams', '$rootScope', 'storesService', '$q',
	function ($scope, $http, $location, $routeParams, $rootScope, storesService, $q) {
		$scope.stores = [];
		$scope.storeProducts = [];
		$scope.total = 0;
		$scope.stores = storesService.query();

		$scope.getStore = function () {
			var id = $routeParams.id;
			$http.get('/api/stores/' + id).then(function (response) {
				$scope.store = response.data.store;
				$scope.storeProducts = response.data.products;
				$scope.owner = response.data.owner;
			});
		};

		$scope.addLikes = function (id) {
			$http.put('/api/products/increaselikes/' + id).then(function (response) {
				$scope.product = response.data;
			});
		};

		$scope.addVisits = function (id) {
			$http.put('/api/stores/visits/' + id).then(function (response) {
				window.location.href = "#/stores/" + id;
			});
		};

		$scope.addStore = function () {
			storesService.save($scope.store, function (response) {
				$scope.stores = storesService.query();
				$scope.store = {};
			});
			window.location.href = '#/stores';
		};

		$scope.removeProduct = function (id) {
			return $http.delete('/api/products/' + id);
		};

		$scope.updateStore = function () {
			var id = $routeParams.id;
			$http.put('/api/stores/' + id, $scope.store).then(function (response) {
				$location.path('/stores/' + id);
			});
		};
	}
]);

app.controller('ordersController', ['$scope', '$http', '$location', '$routeParams', 'ordersService',
	function ($scope, $http, $location, $routeParams, ordersService) {
		$scope.orders = [];
		$scope.total = 0;
		$scope.getOrders = function () {
			$http.get('/api/orders').then(function (response) {
				$scope.orders = response.data;
				angular.forEach($scope.orders, function (order) {
					$scope.total += order.order_total;
				});
				return $scope.total;
			});
		};
	}]);

app.controller('productsController', ['$scope', '$http', '$location', '$routeParams', 'productsService', '$rootScope',
	function ($scope, $http, $location, $routeParams, productsService, $rootScope) {
		$scope.products = [];
		$scope.addToCartMessage = '';

		$scope.getCart = function () {
			return $http.get('/api/basket').then(function (response) {
				$scope.items = response.data.cart.items;
				$scope.user = response.data.user;
				$scope.cart = response.data.cart;
				$scope.title = response.data.title;
			});
		};

		$scope.addToCart = function (id) {
			$http.get('/api/basket/add/' + id).then(function (response) {
				console.log(response);
				$scope.getCart();
				$scope.message = "Product added successfully.";
			});
		};

		$scope.products = productsService.query();

		$scope.getProducts = function () {
			var category = $routeParams.category;
			$http.get('/api/products/' + category).then(function (response) {
				//$scope.products = response.data;
			});
		};

		$scope.postProduct = function () {
			productsService.save($scope.product, function () {
				$scope.products = productsService.query();
				$scope.product = {};
			});
			$location.path('/products');
		};

		$scope.updateProduct = function () {
			var id = $routeParams.id;
			$http.put('/api/products/' + id, $scope.product).then(function (response) {
				window.location.href = "#/products/" + id;
			});
		};

		$scope.getProduct = function () {
			var id = $routeParams.id;
			$http.get('/api/products/' + id).then(function (response) {
				$scope.product = response.data;
			});
		};

		$scope.removeProduct = function (id) {
			$http.delete('/api/products/' + id).then(function (response) {
				window.location.href = "#/";
			});
		};

		$scope.addLikes = function (id) {
			$http.put('/api/products/increaselikes/add/' + id).then(function (response) {
				$scope.product = response.data;
			});
		};

		$scope.reduceLikes = function (id) {
			$http.put('/api/products/decreaselikes/' + id).then(function (response) {
				$scope.product = response.data;
			});
		};

		$scope.addToCart = function (id) {
			$http.get('/api/basket/add/' + id).then(function (response) {
				$scope.getCart();
				$scope.message = response.data;
				window.location.href = "#/products";
			});
		};
	}
]);

app.controller('usersController', ['$scope', '$http', '$location', '$routeParams', '$rootScope', 'storesService', '$q',
	function ($scope, $http, $location, $routeParams, $q) {
		var id = $routeParams.id;
		$scope.getUserWithStores = function () {
			$http.get('/api/users/' + id).then(function (response) {
				$scope.store_info = response.data.stores;
			});
		};
	}
]);

app.controller('cartController', ['$scope', '$http', '$location', '$routeParams',
	function ($scope, $http, $location, $routeParams) {

		$scope.getCart = function () {
			return $http.get('/api/basket').then(function (response) {
				$scope.items = response.data.cart.items;
				$scope.cart = response.data.cart;
			});
		};

		$scope.reduceItem = function (id) {
			return $http.get('/api/basket/' + id + '/reduce').then(function (response) {
				console.log(response);
				$scope.cart = response;
				$location.path("/basket");
			});
		};

		$scope.checkout = function () {
			var cart = localStorage.getItem('cart');
			$http.post('/api/checkout').then(function (response) {
				console.log(response.data);
				$location.path("/products");
			});
		};
	}
]);