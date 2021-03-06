
if (typeof(Viz) == 'undefined') Viz = {};

Viz.Line = function (id){
        this.xMax = 0;
        this.yMax = 0;
        this.YRatio = 0;
        this.overlayDiv= null;
        this.margin = {
          top:25,
          left:50,
          right:25,
          bottom:25
        };
  
        // Get the canvas and context objects
        this.id                = id;
        this.isVizGraph        = true;
        this.canvas            = document.getElementById(id);
        this.context           = this.canvas.getContext ? this.canvas.getContext("2d") : null;
        this.canvas.__object__ = this;
        this.type              = 'line';
  
        this.data = arguments[1];
        this.w = this.canvas.width;
        this.h = this.canvas.height;
  
        this.title = "India population charts";
        this.xLabel = "YEARS";
        this.yLabel = "In millions";
        this.coords = [];
  
};

Viz.Line.prototype.getMaxYDataValue = function() {
    var max = 0;
     
    for(var i = 0; i < this.data.length; i ++) {
        if(this.data[i] > max) {
            max = this.data[i];
        }
    }
    //max += 10 - max % 10;
    return max;
};


/**
    * The getPoint() method - used to get the point the mouse is currently over, if any
    * 
    * @param object e The event object
    * @param object   OPTIONAL You can pass in the bar object instead of the
    *                          function getting it from the canvas
    */
Viz.Line.prototype.getPoint = function (e)
{
  var canvas  = e.target;
  var obj     = canvas.__object__;
  var context = obj.context;
  var mouse  = Viz.getMouseXY(e);
  var mouseX  = mouse.x;
  var mouseY  = mouse.y;
  
  for (var i=0; i<obj.coords.length; ++i) {
    var xCoord = obj.coords[i].x;
    var yCoord = obj.coords[i].y;
    if (mouseX <= (xCoord + 5) && mouseX >= (xCoord - 5) && mouseY <= (yCoord + 5)&& mouseY >= (yCoord - 5)) {
      return {
        ele: obj,
        x: xCoord,
        y: yCoord,
        i:i
      };
    }
  }
};

Viz.Line.prototype.createOverlay = function (){
  
};

Viz.Line.prototype.renderParts = function (){
   this.renderBackground();
   this.renderText();
   this.renderAxis(true);
  
   //var ctx = this.context;
   //ctx.save();
   //ctx.fillRect(this.margin.left,0,this.xMax,this.h);
   //ctx.restore();
};

Viz.Line.prototype.renderAxis = function (shouldRenderText){
  var yInc = Math.round(this.yMax / this.data.length);
  var yPos = 0;
  var xInc = this.getXInc();
  var xPos = this.margin.left;
  
  var margin = this.margin;
  var ctx = this.context;
  
  var yMaxValue = this.getMaxYDataValue();
  
  for(var i = 0; i < this.data.length; i++){
    yPos += (i === 0) ? margin.top : yInc;
    
    // draw horizontal lines
    this.drawLine({x : margin.left, y:yPos, x2:this.xMax+margin.left, y2:yPos},"#E8E8E8");
    
    if (shouldRenderText){
       // y axis labels
      ctx.font = "10pt Calibri";
      var txt = Math.round(yMaxValue - ((i === 0)? 0 : yPos/this.yRatio));
      
      var txtSize = ctx.measureText(txt);

      //ctx.fillText(txt,margin.left-((txtSize.width>=14)?txtSize.width:10)-7,yPos+4);
      ctx.fillText(txt,margin.left-txtSize.width,yPos+4);

      // x axis labels
      if (this.labels !== undefined) {
        txt = this.labels[i];
        txtSize = ctx.measureText(txt);
        ctx.fillText(txt, xPos, this.h-(margin.bottom/2));
      }
      xPos += xInc;
    }
  }
  
  // Vertical line
  this.drawLine({x:margin.left,y:margin.top,x2:margin.left,y2:this.yMax});
  
  // Horizontal line
  //this.drawLine({x:margin.left,y:this.yMax,x2:this.xMax+this.margin.left,y2:this.yMax});
};

Viz.Line.prototype.drawLine = function(pt, strokeStyle, lineWidth){
  var ctx = this.context;
  lineWidth = lineWidth || 1;
  ctx.strokeStyle = (strokeStyle === null) ? "black" : strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(pt.x, pt.y);
  ctx.lineTo(pt.x2,pt.y2);
  
  ctx.stroke();
  ctx.closePath();
};

Viz.Line.prototype.getXInc = function (){
  var len  = this.data.length; 
  
  var xInc = Math.floor(this.xMax / (len));

  return xInc;
};

Viz.Line.prototype.renderBackground = function (){
  var ctx = this.context;
  var margin = this.margin;

  var fStyle = this.fillStyle;

  ctx.save();

  if (!fStyle) {
    fStyle = ctx.createLinearGradient(margin.left, margin.top,this.xMax,this.yMax);
    fStyle.addColorStop(0.0,"#D4D4D4");
    fStyle.addColorStop(0.2,"#fff");
    fStyle.addColorStop(0.8,"#fff");
    fStyle.addColorStop(1,"#D4D4D4");
  }

  ctx.fillStyle = fStyle;
  
  ctx.fillRect(margin.left, margin.top, this.xMax,this.yMax);
  
  ctx.restore();
};

Viz.Line.prototype.renderText = function (){
  var labelFont = "10pt Arial";
  var ctx = this.context;
  var margin = this.margin;
  
  
  ctx.textAlign = "center";
   
  // Title
  ctx.fillText(this.title,(this.w/2),margin.top/2);
  
  // X-axis text
  var txtSize = ctx.measureText(this.xLabel);
  

  ctx.fillText(this.xLabel, 
              margin.left+(this.xMax/2)-(txtSize.width/2),
              this.h-(margin.bottom/4));
  
  // Y-axis text
  ctx.save();
  // rotate 90 degree to left
  ctx.rotate(-Math.PI / 2);
  ctx.font = labelFont;
  ctx.fillText(this.yLabel, (this.yMax/2)*-1,margin.left/4);
  ctx.restore();
};

Viz.Line.prototype.Draw = function (){
  
  var margin = this.margin;
  
  this.xMax = this.w - (margin.left + margin.right);
  this.yMax = this.h - (margin.top + margin.bottom);
  this.yRatio = this.yMax / this.getMaxYDataValue();
  this.renderParts();
  
  var c = this.context;
  c.lineWidth = 2;
  c.strokeStyle = '#333';
  c.font = 'italic 8pt sans-serif';
  c.textAlign = "center";
  
  c.strokeStyle = '#f00';
  c.beginPath();
  
  var xinc = this.getXInc();
  var maxYValue = this.getMaxYDataValue();
  var sx = margin.left;
  var ptY = 0;
  for(var i = 0; i < this.data.length; i ++) {
    ptY = (maxYValue - this.data[i]) * this.yRatio;
    if (ptY < margin.top) ptY = margin.top;
    if (i === 0) {
      c.moveTo(sx, ptY);
      continue;
    }
    sx = sx + xinc;
    c.lineTo(sx, ptY);
  }
  c.stroke();
  
  c.fillStyle = '#333';
 
  sx = margin.left;
  for(var j = 0; j < this.data.length; j ++) {  
    ptY = (maxYValue - this.data[j]) * this.yRatio;
    if (ptY < margin.top) ptY = margin.top;
    c.beginPath();
    c.arc(sx, ptY, 4, 0, Math.PI * 2, true);
    c.fill(); 
    
    this.coords.push({x: sx, y:ptY});
    sx+=xinc;
  }
};

