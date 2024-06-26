const d = new Date();
let month = d.getMonth() + 1;

// Set the dimensions and margins of the graph
var margin = { top: 20, right: 50, bottom: 30, left: 50 }; // Adjust right margin to fit y-axis
var width = 3800 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Append the chart div
var chartDiv = d3
  .select('#chart')
  .append('div')
  .style('width', 700 + margin.left + margin.right + 'px')
  .style('overflow-x', 'scroll')
  .style('margin', '0 auto')
  .style('-webkit-overflow-scrolling', 'touch');

// Append the SVG object to the chart div
var svg = chartDiv
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .style('display', 'block')
  .append('g')
  .style('justify-content', 'flex-end')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');



// Set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Load data from JSON file
d3.json('temp.json', function (error, data) {
  if (error) throw error;

  const allDays = [];
  data.months.forEach((eachMonth, i) => {
    if (month - 4 <= eachMonth.month && eachMonth.month <= month) {
      allDays.push(...eachMonth.days);
    }
  });
  const newData = allDays;

  // Scale the range of the data
  x.domain(
    d3.extent(newData, function (d, i) {
      return i;
    })
  );
  y.domain([
    -10,
    d3.max(newData, function (d) {
      return Math.max(d.maxMaxThisYear, d.avgMax);
    }),
  ]);

  // Add the red area
  svg
    .append('path')
    .datum(newData)
    .attr('fill', '#EB0000')
    .attr('fill-opacity', 0.25)
    .attr('stroke', 'none')
    .attr('class', 'area')
    .attr(
      'd',
      d3
        .area()
        .x(function (d, i) {
          return x(i);
        })
        .y0(function (d) {
          return y(d.avgMax + 0.1);
        })
        .y1(function (d) {
          return y(
            d.maxMaxThisYear > d.avgMax
              ? d.maxMaxThisYear + 0.001
              : d.avgMax - 0.1
          );
        })
    );

  // Add the blue area
  svg
    .append('path')
    .datum(newData)
    .attr('fill', '#80CAFF')
    .attr('fill-opacity', 0.7)
    .attr('stroke', 'none')
    .attr('class', 'area')
    .attr(
      'd',
      d3
        .area()
        .x(function (d, i) {
          return x(i);
        })
        .y0(height)
        .y1(function (d) {
          return y(d.avgMax - 0.1);
        })
    );

  // Define the line generator function
  function lineGenerator() {
    return d3.line().x(function (d, i) {
      return x(i);
    });
  }

  // Define line generators for different datasets
  var valueline = lineGenerator().y(function (d) {
    if (typeof d.maxMaxThisYear === 'number') {
      return y(d.maxMaxThisYear);
    }
  });
  var valueline2 = lineGenerator().y(function (d) {
    return y(d.avgMax);
  });

  // Create a tooltip div
  var div = chartDiv.append('div').attr('class', 'tooltip').style('opacity', 0);

  // Add the valueline paths
  var dataArray = [
    {
      name: '30 TAGE 2023/2024',
      x: 70,
      y: 580,
      class: 'line-text',
      class2: 'line',
      dataline: valueline,
    },
    {
      name: '30 TAGE 1973/2022',
      x: 500,
      y: 580,
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
      .attr('class', 'label-text');
    svg
      .append('rect')
      .attr('x', dataArray[i].x - 70)
      .attr('y', dataArray[i].y - 11)
      .attr('width', 50)
      .attr('height', 10)
      .attr('class', dataArray[i].class);
    svg
      .append('path')
      .data([newData])
      .attr('class', dataArray[i].class2)
      .attr('d', dataArray[i].dataline);
  }

  // Add the dots with tooltips
  var fixeddot = svg
    .selectAll('.dot2')
    .data(newData)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 5)
    .attr('cx', function (d, i) {
      return x(i);
    })
    .attr('cy', function (d) {
      return y(d.maxMaxThisYear);
    })
    .on('mouseover', function (d) {
      if (typeof d.maxMaxThisYear === 'number') {
        div.transition().duration(200).style('opacity', 0.9);
        div
          .html(
            `<p class="highest"> <img src="./assets/temp_up.png"> ${d.maxMaxThisYear} </p>`
          )
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      }
    })
    .on('mouseout', function () {
      div.transition().duration(500).style('opacity', 0);
    });

  var fixeddot2 = svg
    .selectAll('.dot2')
    .data(newData)
    .enter()
    .append('circle')
    .attr('class', 'dot2')
    .attr('r', 7)
    .attr('cx', function (d, i) {
      return x(i);
    })
    .attr('cy', function (d) {
      return y(d.avgMax);
    })
    .on('mouseover', function (d) {
      div.transition().duration(200).style('opacity', 0.9);
      div
        .html(
          `<p class="lowest"> <img src="./assets/temp_down.png">   ${d.avgMax} </p>`
        )
        .style('left', d3.event.pageX + 'px')
        .style('top', d3.event.pageY - 28 + 'px');
    })
    .on('mouseout', function () {
      div.transition().duration(500).style('opacity', 0);
    });

  // Month labels
  var monthLabels = svg
    .selectAll('.month-label')
    .data(data.months)
    .enter()
    .append('text')
    .attr('class', 'month-label')
    .text(function (d) {
      // Define an array of month names
      var monthNames = [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
      ];
      // Use the month number (1-indexed) to retrieve the corresponding month name
      return monthNames[d.month - 1];
    })
    .attr('x', function (d, i) {
      return x(i * 30 + 15);
    })
    .attr('fill', 'gray')
    .attr('y', height + 90);

  var marginTop = 20; // Define the top margin

  // Add the background rectangle for the X axis
  svg
    .append('rect')
    .attr('x', 0)
    .attr('y', height + marginTop)
    .attr('width', width)
    .attr('height', 40) // Adjust the height to fit your needs
    .attr('fill', '#999999');

  // Add the dotted X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + (height + 10) + ')')
    .style('color', 'black') // Change to 'black' or any color that contrasts with white
    .attr('class', 'num-axis x-axis')
    .call(
      d3
        .axisBottom(x)
        .ticks(120)
        .tickFormat(() => '')
    ) // Corrected tickFormat
    .call((g) => {
      g.selectAll('.tick line').style('display', 'none'); // Hide tick lines
      g.selectAll('.tick').append('circle').attr('r', 3).attr('fill', 'gray'); // Append circles to ticks
    });

  // Add the number X Axis
  svg
    .append('g')
    .attr('transform', 'translate(0,' + (height + marginTop) + ')')
    .style('color', 'white') // Change to 'black' or any color that contrasts with white
    .attr('class', 'num-axis x-axis')
    .call(d3.axisBottom(x).ticks(30))
    .call((g) => {
      g.selectAll('line')
        .attr('stroke', 'none') // Hide tick lines
      g.selectAll('text')
        .attr('fill', 'white')
    });

  // Add the Y Axis and grid lines
  svg
    .append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

  // Add the right Y Axis
  svg
  .append('g')
  .attr('transform', 'translate(' + width + ', 0)')
  .attr('class', 'y-axis-right')
  .call(d3.axisRight(y).ticks(10))
  .call((g) => {
    g.selectAll('line')
      .attr('stroke', 'none');
    g.selectAll('text')
      .attr('fill', 'gray')
      .style('font-family', 'Gotham Condensed Book')
      .style('font-size', '27px');
  })
  .style('position', 'absolute')
  .style('right', '0');

  chartDiv.node().scrollLeft = chartDiv.node().scrollWidth - chartDiv.node().clientWidth;
});
