 // set the dimensions and margins of the graph
 var margin = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 50
},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

// set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// define the line  
function basicy() {
var ret = d3.line()
  .x(function (d) {
      return x(d.year);
  })
return ret;
}
var valueline = basicy()
.y(function (d) {
  return y(d.GNI);
});
var valueline2 = basicy()
.y(function (d) {
  return y(d.PGDI);
});
var valueline3 = basicy()
.y(function (d) {
  return y(d.PPP);
});
var valueline4 = basicy()
.y(function (d) {
  return y(d.xyz);
});
var div = d3.select("#chart").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("#chart").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
  "translate(" + margin.left + "," + margin.top + ")");

// Get the data
var datalist = [];
d3.csv("data.csv", function (error, data) {
if (error) throw error;
// scale the range of the data
x.domain(d3.extent(data, function (d) {
  return d.year;
}));
y.domain([0, d3.max(data, function (d) {
  return Math.max(d.GNI, d.PGDI, d.PPP,d.xyz);
})]);

// add the valueline path.
//그냥 data를 하게 되면 array[16]이 되지만, [data]를 하게 되면 array[1]안에 있는 array[16]이 된다. 
var dataArray = [{
  "name": "GNI",
  "x": 100,
  "y": 50,
  "class": "line-text",
  "class2": "line",
  "dataline": valueline
}, {
  "name": "PGDI",
  "x": 100,
  "y": 70,
  "class": "line2-text",
  "class2": "line2",
  "dataline": valueline2
}]
for (var i = 0; i < dataArray.length; i++) {
  svg.append("text").text(dataArray[i].name)
      .attr("x", dataArray[i].x)
      .attr("y", dataArray[i].y);
  svg.append("rect")
      .attr("x", dataArray[i].x - 70)
      .attr("y", dataArray[i].y - 11)
      .attr("width", 50)
      .attr('height', 10)
      .attr('class', dataArray[i].class)
  svg.append("path")
      .data([data])
      .attr("class", dataArray[i].class2)
      .attr("d", dataArray[i].dataline) 
}

// add the dots with tooltips
var fixeddot = svg.selectAll("dot")
  .data(data)
  .enter().append("circle")
  .attr("r", 5)
var fixeddot2 = svg.selectAll("dot")
  .data(data)
  .enter().append("circle")
  .attr("r", 5)
var fixeddot3 = svg.selectAll("dot")
  .data(data)
  .enter().append("circle")
  .attr("r", 5)
  var fixeddot4 = svg.selectAll("dot")
  .data(data)
  .enter().append("circle")
  .attr("r", 4)

fixeddot.attr("cx", function (d) {
      return x(d.year);
  })
  .attr("cy", function (d) {
      return y(d.GNI);
  })
  .on("mouseover", function (d) {
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div.html("<p>년도:" + d.year + "</p> <p>GNI:" + d.GNI + "</p>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
  });

fixeddot2.attr("cx", function (d) {
      return x(d.year);
  })
  .attr("cy", function (d) {
      return y(d.PGDI);
  })
  .on("mouseover", function (d) {
      div.transition()
          .duration(200)
          .style("opacity", .9);
      div.html("<p>년도:" + d.year + "</p> <p>PGDI:" + d.PGDI + "</p>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
  });

// add the X Axis
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));
  svg.append("g")
  .attr("class", "grid")
  .call(d3.axisLeft(y)
          .tickSize(-width)
          .tickFormat("")
  );

// add the Y Axis
svg.append("g")
  .call(d3.axisLeft(y))
  .select('.domain')
  .attr('stroke-width', 0);

});