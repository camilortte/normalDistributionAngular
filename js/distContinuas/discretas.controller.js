(function () {


angular.module('discretasApp')
    .controller('discretasController', discretasController);

discretasController.$inject = [
    '$scope'
];

function discretasController($scope) {

    var vm = $scope;
    console.log("Ingresa");

    vm.para = {
mu1: 3,
sigma1: 3,
df: 3
};

var rectas = {
    recta1: vm.para.mu1,
    recta2: vm.para.mu1 + 1
}

vm.rectas = rectas;
vm.viewZ = true;


var bodyw = parseInt(d3.select('body').style('width'), 10);
if (bodyw < 767) {
    var aspect = 0.6;
    var margin = {
        top: 40,
        right: 15,
        bottom: 20,
        left: 15
    };
} else {
    var aspect = 0.4;
    var margin = {
        top: 40,
        right: 20,
        bottom: 30,
        left: 20
    };
}

var w = parseInt(d3.select('#viz').style('width'), 10);
w = w - margin.left - margin.right;
var h = aspect * w - margin.top - margin.left;

var xmin = -15,
    xmax = 15;
vm.cosa1 = xmin;
vm.cosa2 = xmax;
vm.xmin = xmin;
vm.xmax = xmax;

// x.values 
var x = [];
for (var i = xmin; i <= xmax; i += 0.01) {
    x.push(i);
}

// Generates data
function genData(mu, sigma) {
    var y = [];
    for (var i = 0; i < x.length; i++) {
        y.push(jStat.normal.pdf(x[i], mu, sigma));
    }
    var tmp = [];
    for (var i = 0; i < x.length; i++) {
        tmp.push([x[i], y[i]]);
    }
    var data = {
        data: tmp,
        x: x,
        y: y
    };
    return data;
}

function genDataT(df) {
    var y = [];
    for (var i = 0; i < x.length; i++) {
        y.push(jStat.studentt.pdf(x[i], df));
    }

    var tmp = [];
    for (var i = 0; i < x.length; i++) {
        tmp.push([x[i], y[i]]);
    }
    tmp.unshift([xmin, 0]);
    tmp.push([xmax, 0]);
    var data = {
        data: tmp,
        x: x,
        y: y
    };
    return data;
}

// Data sets
var data1 = genData(vm.para.mu1, vm.para.sigma1),
    data2 = genData(0, vm.para.sigma1);

function genDataPoly() {
    var poly = [];
    for (var i = 0; i < data1.data.length; i++) {

        var tmp_y = Math.max(data1.y[i], data1.y[i]),
            tmp_x = data1.x[i];
        var tmp = [tmp_x, tmp_y];

        poly.push(tmp);
    }
    poly.unshift([xmin, 0]);
    poly.push([xmax, 0]);    
    return poly;
}

var poly = genDataPoly();

// Axes min and max
var y_max = d3.max([d3.max(data1.y), d3.max(data2.y)]);


// Create scales
var xScale = d3.scale.linear().domain([xmin, xmax]).range([0, w]);
var yScale = d3.scale.linear().domain([0, y_max]).range([0, h]);

// Line function
var line = d3.svg.line()
    .x(function(d) {
        return xScale(d[0])
    })
    .y(function(d) {
        return h - yScale(d[1]);
    })

// Append SVG
var svg = d3.select("#viz")
    .append("svg")
    .attr("height", h + margin.top + margin.bottom)
    .attr("width", w + margin.left + margin.right)
    .attr("id", "SVG-container");


var dists = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");


//Define X axis
var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickSize(5);

var xAx = dists.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h) + ")")
    .call(xAxis);


// legend
g.append("svg:text")
    .attr("class", "legend")
    .attr("x", 25)
    .attr("y", 0)
    .text("Transformación a Z");

g.append("svg:line")
    .attr("class","dist2")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", -5)
    .attr("y2", -5);

g.append("svg:text")
    .attr("class", "legend")
    .attr("x", 25)
    .attr("y", 15)
    .text("Distribución Normal");   

g.append("svg:line")
    .attr("class","dist1")
    .attr("x1", 0)
    .attr("x2", 20)
    .attr("y1", 10)
    .attr("y2", 10);    

// fills
// fills
var t = textures.lines()
    .size(8)
    .strokeWidth(2).stroke("#6C7889");

dists.call(t);


// Append dists
cutline1 = g.append("svg:line")
    .attr("id", "drag1")
    .attr("x1", xScale(vm.rectas.recta1))
    .attr("x2", xScale(vm.rectas.recta1))
    .attr("y1", 0)
    .attr("y2", h)

cutline2 = g.append("svg:line")
    .attr("id", "drag2")
    .attr("x1", xScale(vm.rectas.recta2))
    .attr("x2", xScale(vm.rectas.recta2))
    .attr("y1", 0)
    .attr("y2", h);

// clip-path
var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("x",cutline1.attr('x1'))
    .attr("y", "0")
    .attr("width", parseFloat(cutline2.attr('x1') - cutline1.attr('x1')))
    // .attr("width", xScale(0))
    .attr("height", h);


var overlap = dists.append("svg:path")
    .attr("fill", t.url())
    .attr("d", line(poly))
    .attr("class", "poly")
    .attr("clip-path", "url(#clip)");

var dist2 = dists.append("svg:path")
    .attr("d", line(data2.data))
    .attr("id", "dist2");

var dist1 = dists.append("svg:path")
    .attr("d", line(data1.data))
    .attr("id", "dist1");

// pnorm
var zq = jStat.normal.cdf(-1.6444, 0, 1);
var tq = jStat.studentt.cdf(-1.6444, vm.para.df);

if (bodyw < 767) {
    var pw = 20,
        px1 = w - 40;
} else {
    var pw = 100,
        px1 = w - 140;
}

//texto 
var labQz = g.append("svg:text")
    .attr("class", "pnorm")
    .attr("text-anchor", "end")
    .attr("x", px1 - 10)
    .attr("y", 10)
    .text("P("+ vm.rectas.recta1 + "< x < "+vm.rectas.recta2+")");


var rectQzBg = g.append("svg:rect")
    .attr("class", "pnormBg")
    .attr("x", px1)
    .attr("y", 3)
    .attr("width", pw)
    .attr("height", 10);

var rectQz = g.append("svg:rect")
    .attr("class", "pnorm")
    .attr("x", px1)
    .attr("y", 3)
    .attr("width", pw * zq)
    .attr("height", 10);

var labQzp = g.append("svg:text")
    .attr("class", "pnorm")
    .attr("text-anchor", "start")
    .attr("x", px1 + pw + 10)
    .attr("y", 10)
    .text(d3.round(zq, 3));

var brush = d3.svg.brush()
    .x(xScale)
    .extent([0, 0])


function updateP(value) {
    normalito = jStat.normal.cdf(vm.rectas.recta2, vm.para.mu1, vm.para.sigma1);
    normalito -= jStat.normal.cdf(vm.rectas.recta1, vm.para.mu1, vm.para.sigma1);
    console.log("VEa esto da: ", normalito);

    zq = normalito;

    //aca la idea es tener los dos valores de x
    labQz.text("P("+  d3.round(vm.rectas.recta1,2) +"<X<" + d3.round(vm.rectas.recta2, 2) + ")");

    rectQz.transition()
        .attr("width", pw * zq);

    labQzp.text(d3.round(normalito, 3));
}


function brushed() {
    var value = brush.extent()[0];

    if (d3.event.sourceEvent) { // not a programmatic event
        value = xScale.invert(d3.mouse(this)[0]);
        brush.extent([value, value]);
    }


    clip.attr("width", parseFloat(cutline2.attr('x1') - cutline1.attr('x1')) ) // here is the shit
        .attr("x", (cutline1.attr('x1')));
    updateP(value);
}


function reDrawDist2(newdata) {
    dists.select("#dist2")
        .transition()
        .duration(600)
        .attr("d", line(data2.data));
}

function reDrawDist1(newdata) {    
    dists.select("#dist1")
        .transition()
        .duration(600)
        .attr("d", line(data1.data));
}

function reDrawDistPoly(newdata) {
    poly = genDataPoly();
    overlap
        .transition()
        .duration(600)
        .attr("d", line(poly));
}

function update_brush(value){    
    brush.extent([value, value]);
    clip.attr("width", parseFloat(cutline2.attr('x1') - cutline1.attr('x1')) ) // here is the shit
        .attr("x", (cutline1.attr('x1')));  
    updateP();
}

// show or not function z
vm.show_z = function(){
    var status = vm.viewZ;     
    dists.select("#dist2")
        .transition()
        .duration(600)
        .attr("d", line(data2.data))
        .style("visibility", function(d) {
            return status == false ? "hidden" : "visible";
            }
        )
}


// Change vertival lines
vm.changeRect = function(){
    var value1 = parseFloat(vm.rectas.recta1);
    var value2 = parseFloat(vm.rectas.recta2);

    if (value1<value2){
        cutline1
            .attr("x1", xScale(value1))
            .attr("x2", xScale(value1));
        cutline2
            .attr("x1", xScale(value2))
            .attr("x2", xScale(value2));
        update_brush();
    }else{
        value1+=0.1;
        vm.rectas.recta2 = value1;
        cutline1
            .attr("x1", xScale(value1))
            .attr("x2", xScale(value1));
        cutline2
            .attr("x1", xScale(value2))
            .attr("x2", xScale(value2));
        update_brush();
    }
}

//Change Curves
vm.changeCurve = function(){    
    data1 = genData(vm.para.mu1, vm.para.sigma1);
    data2 = genData(0, vm.para.sigma1);

    reDrawDist1()
    reDrawDist2()
    reDrawDistPoly()
    update_brush();
}


vm.init = function(){
    xmin = parseFloat(vm.cosa1),
    xmax = parseFloat(vm.cosa2);

    vm.xmin = xmin;
    vm.xmax = xmax;

    console.log(vm.cosa1, vm.cosa2);

    // x.values 
    x = [];
    for (var i = xmin; i <= xmax; i += 0.01) {
        x.push(i);
    }
    // Axes min and max
    y_max = d3.max([d3.max(data1.y), d3.max(data2.y)]);


    // Create scales
    xScale = d3.scale.linear().domain([xmin, xmax]).range([0, w]);
    yScale = d3.scale.linear().domain([0, y_max]).range([0, h]);

    // Line function
    line = d3.svg.line()
        .x(function(d) {
            return xScale(d[0])
        })
        .y(function(d) {
            return h - yScale(d[1]);
        })

    // Append SVG
    svg
        .attr("height", h + margin.top + margin.bottom)
        .attr("width", w + margin.left + margin.right)
        .attr("id", "SVG-container");


    dists 
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


    g
        .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");


    xAxis
        .scale(xScale)
        .orient("bottom")
        .tickSize(5);

    xAx
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (h) + ")")
        .call(xAxis);

    zq = jStat.normal.cdf(-1.6444, 0, 1);
    tq = jStat.studentt.cdf(-1.6444, vm.para.df);

    if (bodyw < 767) {
        pw = 20,
            px1 = w - 40;
    } else {
        pw = 100,
            px1 = w - 140;
    }
    brush
        .x(xScale)
        .extent([0, 0])

    vm.changeCurve();
    vm.changeRect();
}


        
    }
})();