
if (typeof(Viz) == 'undefined') Viz = {};

Viz.Bar = function (id){
        this.barWidth = 10;
        this.spaceBetween = 5;
        this.spaceBetweenGroups = 10;
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
        this.coords = [];
        if (Viz.isArray(this.data[0])) {
         this.graphtype = "grouped";
        }
};

Viz.Bar.prototype.getMaxYDataValue = function(data) {
    var max = 0;
    var flatten = [];
    flatten = flatten.concat.apply(flatten, data);
    for(var i = 0; i < flatten.length; i ++) {
        if(flatten[i] > max) {
            max = flatten[i];
        }
    }
    //max += 10 - max % 10;
    console.log("MAX Y: " , max);
    return max;
};

Viz.Bar.prototype.getDataLength = function(data) {
    var max = 0;
    var flatten = [];
    flatten = flatten.concat.apply(flatten, data);
    console.log("Flatten Len: ", flatten.length);
    return flatten.length;
};

/* Gets the min data value */
Viz.Bar.prototype.getMinYDataValue = function(data) {
    var min = 0;
    var flatten = [];
    flatten = flatten.concat.apply(flatten, data);
    for(var i = 0; i < flatten.length; i ++) {
        if(flatten[i] < min) {
            min = flatten[i];
        }
    }
    //max += 10 - max % 10;
    console.log("MIN Y: " , min);
    return max;
};


/**
    * The getPoint() method - used to get the point the mouse is currently over, if any
    * 
    * @param object e The event object
    * @param object   OPTIONAL You can pass in the bar object instead of the
    *                          function getting it from the canvas
    */
Viz.Bar.prototype.getPoint = function (e)
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

Viz.Bar.prototype.createOverlay = function (){
  
};

Viz.Bar.prototype.renderParts = function (){
   this.renderBackground();
   this.renderText();
   this.renderAxis(true);
};

Viz.Bar.prototype.renderAxis = function (shouldRenderText){

  var scales = Viz.getScalarScales(1,10,-50, 100);

  console.log("Scales: ", scales);

  var yInc = Math.round(this.yMax / this.data.length);
  var yPos = 0;
  var xInc = this.getXInc();
  var xPos = this.margin.left + 20;  // leave some space in the left
  
  var margin = this.margin;
  var ctx = this.context;
  
  var yMaxValue = this.getMaxYDataValue(this.data);
  console.log("yMaxValue: ", yMaxValue);

  /*
  var barWidth = (this.w - margin.left) * 85 / 100 / this.data.length;
  var barSpacing = (this.w - margin.left) * 15 / 100 / (this.data.length + 1);

  var categoryWidth = (this.w - margin.left) * (1 - 0.2) / this.data.length;
  var categorySpacing = (this.w - margin.left) * 0.2 / (this.data.length + 1);
     */ 

  var BAR_PERCENT = 0.15;
  var CATEGORY_PERCENT = 0.2;

  var categoryWidth = (this.w - margin.left) * (1 - CATEGORY_PERCENT) / this.getDataLength(this.data);
  var categorySpacing = (this.w - margin.left) * CATEGORY_PERCENT/ (this.getDataLength(this.data) + 1);

  var barWidth = categoryWidth * (1-BAR_PERCENT )/ this.getDataLength(this.data);
  var barSpacing = categoryWidth * BAR_PERCENT / (this.getDataLength(this.data) - 1);
  

  console.log("BarWidth: ", barWidth);
  console.log("BarSpacing: ",barSpacing);

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
      if (this.graphtype === "grouped") {
        //xPos += xInc + this.spaceBetweenGroups + (this.barWidth * 2);
        //xPos += (xInc*2);
        xPos += barWidth +barSpacing;
      }
      else{
        //xPos += xInc ;
        xPos += barWidth + barSpacing;
      }
    }
  }
  
  // Vertical line
  this.drawLine({x:margin.left,y:margin.top,x2:margin.left,y2:this.yMax});
};

Viz.Bar.prototype.drawLine = function(pt, strokeStyle, lineWidth){
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

Viz.Bar.prototype.getXInc = function (){
  var len  = this.data.length; 

  if (Viz.isArray(this.data[0])) {
     len = this.data.length * this.data[0].length * this.barWidth ;
  }
  
  // todo: pending bar x axis pos calculation

  console.log("Bars: ",len)
  var xInc = Math.floor(this.xMax / (len));

  console.log("xInc: ", xInc);
  return xInc;
};

Viz.Bar.prototype.renderBackground = function (){
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

Viz.Bar.prototype.renderText = function (){
  var labelFont = "10pt Arial";
  var ctx = this.context;
  var margin = this.margin;
  
  
  ctx.textAlign = "center";
   
  // Title
  ctx.fillText(this.title,(this.w/2),margin.top/2);
  
  if (this.xLabel){
    // X-axis text
    var txtSize = ctx.measureText(this.xLabel);
    ctx.fillText(this.xLabel, 
                margin.left+(this.xMax/2)-(txtSize.width/2),
                this.h-(margin.bottom/4));
  }
  
  if (this.yLabel) {
    // Y-axis text
    ctx.save();
    // rotate 90 degree to left
    ctx.rotate(-Math.PI / 2);
    ctx.font = labelFont;
    ctx.fillText(this.yLabel, (this.yMax/2)*-1,margin.left/4);
    ctx.restore();
  }
};

Viz.Bar.prototype.Draw = function (){
  var margin = this.margin;
  
  this.xMax = this.w - (margin.left + margin.right);
  this.yMax = this.h - (margin.top + margin.bottom);
  this.yRatio = this.yMax / this.getMaxYDataValue(this.data);
  this.renderParts();
  
  var c = this.context;
  c.lineWidth = 2;
  c.strokeStyle = '#333';
  c.font = 'italic 8pt sans-serif';
  c.textAlign = "center";
  c.save();

  c.beginPath();
  
  var xinc = this.getXInc();
  var maxYValue = this.getMaxYDataValue(this.data);
  var sx = margin.left + 10;
  var ptY = 0;

  var top;

  var BAR_PERCENT = 0.85;
  var CATEGORY_PERCENT = 0.2;

  var categoryWidth = (this.w - margin.left) * (1 - CATEGORY_PERCENT) / this.getDataLength(this.data);
  var categorySpacing = (this.w - margin.left) * CATEGORY_PERCENT/ (this.getDataLength(this.data) + 1);

  var barWidth = categoryWidth * (1-BAR_PERCENT )/ this.getDataLength(this.data);
  var barSpacing = categoryWidth * BAR_PERCENT / (this.getDataLength(this.data) - 1);
  
      
  c.strokeStyle = "rgba(100,255,255,0.5)"; //'#f00';
  
  for(var i = 0; i < this.data.length; i ++) {
    var markX =  categorySpacing + categoryWidth / 2 + i * (categoryWidth + categorySpacing);
    if (Viz.isArray(this.data[i])) {
      for(var j = 0; j < this.data[i].length; j++) {
        ptY = (maxYValue - this.data[i][j]) * this.yRatio;
      
        if (ptY < margin.top) ptY = margin.top;
        top = (this.h - this.margin.bottom) - ptY;
        
        sx =  margin.left + markX - categoryWidth / 2 + j * (barWidth + barSpacing) + barWidth / 2;
        this.renderBar(sx, ptY, this.barWidth, top);
        //sx = sx + barWidth + barSpacing; // space between bars in group
        
      }      
      //sx = sx + categorySpacing; 
    }
    else {
      ptY = (maxYValue - this.data[i]) * this.yRatio;
      if (ptY < margin.top) ptY = margin.top;
      top = (this.h - this.margin.bottom) - ptY;
      this.renderBar(sx, ptY, this.barWidth, top);
      //sx = sx + xinc; 
      //sx = sx + barWidth + barSpacing;
      sx = sx + markX - categoryWidth / 2 + j * (barWidth + barSpacing) + barWidth / 2;
    }
  }
  c.restore();
};

Viz.Bar.prototype.renderBar = function (x,y,w,h){
  var c = this.context;
  c.rect(x, y,w, h);
  c.stroke();
  c.fillStyle = "rgba(100,255,255,0.5)";
  c.fill();
};
