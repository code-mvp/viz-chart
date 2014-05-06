if (typeof(Viz) == 'undefined') Viz = {};

// Utility functions
Viz.clamp = function(v, min, max){
  return v < min ? min : (v > max ? max : v);
};

// Chart Library



Viz.events = [];

 /**
    * Adds an event handler
    * 
    * @param object obj   The graph object
    * @param string event The name of the event, eg ontooltip
    * @param object func  The callback function
    */
Viz.AddCustomEventListener = function (obj, name, func)
{
  if (typeof(Viz.events[obj.id]) == 'undefined') {
    Viz.events[obj.id] = [];
  }

  Viz.events[obj.id].push([obj, name, func]);

  return Viz.events[obj.id].length - 1;
};

/**
    * Used to fire one of the RGraph custom events
    * 
    * @param object obj   The graph object that fires the event
    * @param string event The name of the event to fire
    */
Viz.FireCustomEvent = function (obj, name){
  if (obj && obj.isVizGraph) {
    var id = obj.id;

    if (typeof(id) == 'string' && typeof(Viz.events) == 'object' && typeof(Viz.events[id]) == 'object' && Viz.events[id].length > 0) {

      for(var j=0; j<Viz.events[id].length; ++j) {
        if (Viz.events[id][j] && Viz.events[id][j][1] == name) {
          Viz.events[id][j][2](obj);
        }
      }
    }
  }
};


/**
    * Checks the browser for traces of MSIE8
    */
Viz.isIE8 = function ()
{
  return navigator.userAgent.indexOf('MSIE 8') > 0;
};


/**
    * Checks the browser for traces of MSIE9
    */
Viz.isIE9 = function ()
{
  return navigator.userAgent.indexOf('MSIE 9') > 0;
};


/**
    * Checks the browser for traces of MSIE9
    */
Viz.isIE9up = function ()
{
  navigator.userAgent.match(/MSIE (\d+)/);

  return Number(RegExp.$1) >= 9;
};


/**
    * This function returns the mouse position in relation to the canvas
    * 
    * @param object e The event object.
*/
Viz.getMouseXY = function (e)
{
  var obj = (Viz.isIE8() ? event.srcElement : e.target);
  var x;
  var y;

  if (Viz.isIE8()) e = event;

  // Browser with offsetX and offsetY
  if (typeof(e.offsetX) == 'number' && typeof(e.offsetY) == 'number') {
    x = e.offsetX;
    y = e.offsetY;

    // FF and other
  } else {
    x = 0;
    y = 0;

    while (obj != document.body && obj) {
      x += obj.offsetLeft;
      y += obj.offsetTop;

      obj = obj.offsetParent;
    }

    x = e.pageX - x;
    y = e.pageY - y;
  }

  return{
    x: x,
    y: y
  };
};
