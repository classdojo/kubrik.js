var async = require("async")

module.exports = function (router) {

  var paramHandlers = {};

  router.param = function (name, fn) {
    paramHandlers[name] = fn;
    fn.paramName = name;
  }

  router.routes.decorators.add({
    test: function (route) {
      return !!route.params.length;
    },
    decorate: function (route) {

      var phandlers = route.params.map(function (name) {
        return paramHandlers[name];
      }).filter(function (h) {
        return !!h;
      });

      route.mediator.on("pre enter", function (message, next) {
        async.eachSeries(phandlers, function (handler, next) {
          handler(message.data, function (err, value) {
            
            if (err) return next(err);
            if (value != null) {
              message.data.set("params." + handler.paramName, value);
            }

            next();
          });
        }, next);
      }); 
    }
  });
}