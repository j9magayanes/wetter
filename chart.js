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
    return x(d.year);
  });
}

// Define line generators for different datasets
var valueline = lineGenerator().y(function (d) {
  return y(d.GNI);
});
var valueline2 = lineGenerator().y(function (d) {
  return y(d.PGDI);
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
    -15,
    d3.max(data, function (d) {
      return Math.max(d.maxMaxThisYear, d.minMinThisYear);
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
  dataArray.forEach(function (dataItem) {
    svg
      .append('text')
      .text(dataItem.name)
      .attr('x', dataItem.x)
      .attr('y', dataItem.y);

    svg
      .append('rect')
      .attr('x', dataItem.x - 70)
      .attr('y', dataItem.y - 11)
      .attr('width', 50)
      .attr('height', 10)
      .attr('class', dataItem.class);

    svg
      .append('path')
      .data([data])
      .attr('class', dataItem.class2)
      .attr('d', dataItem.dataline);
  });

  // Add the dots with tooltips
  var dots = svg
    .selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 5)
    .on('mouseover', function (d) {
      div.transition().duration(200).style('opacity', 0.9);
      div
        .html('<p>년도:' + d.year + '</p> <p>GNI:' + d.maxMaxThisYear + '</p>')
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    });

  // Position dots based on data
  dots
    .attr('cx', function (d) {
      return x(d.year);
    })
    .attr('cy', function (d) {
      return y(d.GNI);
    });

  // Add the X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .style('stroke-dasharray', '1 10')
    .call(d3.axisBottom(x));

  // Add the Y Axis and grid lines
  svg
    .append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

  svg
    .append('g')
    .call(d3.axisLeft(y))
    .select('.domain')
    .attr('stroke-width', 0);

  // Add the area
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'red')
    .attr('fill-opacity', 0.3)
    .attr('stroke', 'none')
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return x(d.day);
        })
        .y0(height)
        .y1(function (d) {
          return y(d.maxMaxThisYear);
        })
    );
  svg
    .append('path')
    .datum(data)
    .attr('fill', 'SKYBLUE')
    .attr('fill-opacity', 0.7)
    .attr('stroke', 'none')
    .attr(
      'd',
      d3
        .area()
        .x(function (d) {
          return x(d.day);
        })
        .y0(height)
        .y1(function (d) {
          return y(d.minMinThisYear);
        })
    );
});
