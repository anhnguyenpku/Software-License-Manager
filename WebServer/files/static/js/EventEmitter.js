function EventEmitter() {}

EventEmitter.prototype.on =
EventEmitter.prototype.addListener = function (event, callback) {
  this._events = this._events || {};
  this._events[event] = this._events[event] || [];
  this._events[event].push(callback);
  return this;
};

EventEmitter.prototype.removeListener = function (event, callback) {
  this._events = this._events || {};
  if (event in this._events === false)  return;
  this._events[event].splice(this._events[event].indexOf(callback), 1);
  return this;
};

EventEmitter.prototype.emit = function (event) {
  this._events = this._events || {};
  if (event in this._events === false) return false;
  for (var i=0; i < this._events[event].length; i++) {
    this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
  }
  return true;
};