// Set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Define the line generator function
function lineGenerator() {
  return d3.line().x(function (d) {
    return x(d.day);
  });
}

// Define line generators for different datasets
var valueline = lineGenerator().y(function (d) {
  return y(d.maxMaxThisYear);

});
var valueline2 = lineGenerator().y(function (d) {
  return y(d.avgMax);
});

// Create a tooltip div
var div = d3
  .select('#chart')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// Append the SVG object to the chart div
var svg = d3
  .select('#chart')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Load data from CSV file
d3.json('data.json', function (error, data) {
  if (error) throw error;

  // Scale the range of the data
  x.domain(
    d3.extent(data, function (d) {
      return d.day;
    })
  );
  y.domain([
    -10,
    d3.max(data, function (d) {
      return Math.max(d.maxMaxThisYear, d.avgMax);
    }),
  ]);

  // Add the valueline paths
  var dataArray = [
    {
      name: '30 TAGE 2023/2024',
      x: 70,
      y: 550,
      class: 'line-text',
      class2: 'line',
      dataline: valueline,
    },
    {
      name: '30 TAGE 1973/2022',
      x: 500,
      y: 550,
      class: 'line2-text',
      class2: 'line2',
      dataline: valueline2,
    },
  ];

  for (var i = 0; i < dataArray.length; i++) {
    svg
      .append('text')
      .text(dataArray[i].name)
      .attr('x', dataArray[i].x)
      .attr('y', dataArray[i].y)
      .attr('class', "label-text")
    svg
      .append('rect')
      .attr('x', dataArray[i].x - 70)
      .attr('y', dataArray[i].y - 11)
      .attr('width', 50)
      .attr('height', 10)
      .attr('class', dataArray[i].class);
    svg
      .append('path')
      .data([data])
      .attr('class', dataArray[i].class2)
      .attr('d', dataArray[i].dataline);
  }

  // add the dots with tooltips
  var fixeddot = svg
    .selectAll('.dot2')
    .data(data)
    .enter()
    .append('circle')
    .attr("class", "dot") 
    .attr('r', 5);
  var fixeddot2 = svg
    .selectAll('.dot2')
    .data(data)
    .enter()
    .append('circle')
    .attr("class", "dot2") 
    .attr('r', 7);


  fixeddot
    .attr('cx', function (d) {
      return x(d.day);
    })
    .attr('cy', function (d) {
      return y(d.maxMaxThisYear);
    })
    .on('mouseover', function (d) {
      div.transition().duration(200).style('opacity', 0.9);
      div
        .html(`<p class="highest"> <img src="./assets/temp_up.png"> ${d.maxMaxThisYear} </p>`)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    });

  fixeddot2
    .attr('cx', function (d) {
      return x(d.day);
    })
    .attr('cy', function (d) {
      return y(d.avgMax);
    })
    .on('mouseover', function (d) {
      div.transition().duration(200).style('opacity', 0.9);
      div
        .html(`<p class="lowest"> <img src="./assets/temp_down.png">   ${d.avgMax} </p>`)
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    });

  // Add the X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .style('stroke-dasharray', '2 2')
    .call(d3.axisBottom(x));



  // Add the Y Axis and grid lines
svg
    .append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    var yscale = d3.scaleLinear() 
            .domain([0, 100]) 
            .range([height - 50, 0]); 
    var y_axis = d3.axisRight(yscale); 
     
  
  svg
    .append('g')
    .select('.domain')
    .attr("transform", "translate(100,10)")
    .attr('stroke-width', 0)
    .call(y_axis)


  // Add the area
  svg
    .append('path')
    .datum(data)
    .attr('fill', '#EB0000')
    .attr('fill-opacity', 0.25)
    .attr('stroke', 'none')
    .attr('class', "area")
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return x(d.day);
        })
        .y0(function (d) {
          return y(d.avgMax  + 0.09);
        })
        .y1(function (d) {
          if (d.maxMaxThisYear > d.avgMax) {
          return y(d.maxMaxThisYear+ 0.001 )
          } else {
            return y(d.avgMax - 0.1);
          }
        })
    );
  svg
    .append('path')
    .datum(data)
    .attr('fill', '#80CAFF')
    .attr('fill-opacity', 0.7)
    .attr('stroke', 'none')
    .attr('class', "area")
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return x(d.day);
        })
        .y0(height)
        .y1(function (d) {
          return y(d.avgMax - 0.1);
        })
    );
});
