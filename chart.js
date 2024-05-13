// Set the dimensions and margins of the graph
var margin = { top: 20, right: 20, bottom: 30, left: 50 };
var width = 7000 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

// Append the chart div
var chartDiv = d3.select('#chart').append('div')
    .style("width", 700 + margin.left + margin.right + "px") // Set width in CSS
    .style("overflow-x", "scroll") // Enable horizontal scrolling
    .style("margin", "0 auto") 
    .style("-webkit-overflow-scrolling", "touch"); // Enable smooth scrolling for WebKit browsers

// Append the SVG object to the chart div
var svg = chartDiv.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Set the ranges
var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Load data from JSON file
d3.json('temp.json', function (error, data) {
    if (error) throw error;

    const allDays = [];
    data.months.forEach((eachMonth, i) => {
        allDays.push(...eachMonth.days);
    });
    const newData = allDays;

    // Scale the range of the data
    x.domain(d3.extent(newData, function (d, i) { return i; }));
    y.domain([-10, d3.max(newData, function (d) { return Math.max(d.maxMaxThisYear, d.avgMax); })]);

    // Add the red area
    svg.append('path')
        .datum(newData)
        .attr('fill', '#EB0000')
        .attr('fill-opacity', 0.25)
        .attr('stroke', 'none')
        .attr('class', 'area')
        .attr('d', d3.area()
            .x(function (d,i) { return x(i); })
            .y0(function (d) { return y(d.avgMax + 0.1); })
            .y1(function (d) { return y(d.maxMaxThisYear > d.avgMax ? d.maxMaxThisYear + 0.001 : d.avgMax - 0.1); })
        );

    // Add the blue area
    svg.append('path')
        .datum(newData)
        .attr('fill', '#80CAFF')
        .attr('fill-opacity', 0.7)
        .attr('stroke', 'none')
        .attr('class', 'area')
        .attr('d', d3.area()
            .x(function (d,i) { return x(i); })
            .y0(height)
            .y1(function (d) { return y(d.avgMax - 0.1); })
        );

    // Define the line generator function
    function lineGenerator() { return d3.line().x(function (d,i) { return x(i); }); }

    // Define line generators for different datasets
    var valueline = lineGenerator().y(function (d) { return y(d.maxMaxThisYear); });
    var valueline2 = lineGenerator().y(function (d) { return y(d.avgMax); });

    // Create a tooltip div
    var div = chartDiv.append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Add the valueline paths
    var dataArray = [
        { name: '30 TAGE 2023/2024', x: 70, y: 550, class: 'line-text', class2: 'line', dataline: valueline },
        { name: '30 TAGE 1973/2022', x: 500, y: 550, class: 'line2-text', class2: 'line2', dataline: valueline2 }
    ];

    for (var i = 0; i < dataArray.length; i++) {
        svg.append('text')
            .text(dataArray[i].name)
            .attr('x', dataArray[i].x)
            .attr('y', dataArray[i].y)
            .attr('class', 'label-text');
        svg.append('rect')
            .attr('x', dataArray[i].x - 70)
            .attr('y', dataArray[i].y - 11)
            .attr('width', 50)
            .attr('height', 10)
            .attr('class', dataArray[i].class);
        svg.append('path')
            .data([newData])
            .attr('class', dataArray[i].class2)
            .attr('d', dataArray[i].dataline);
    }

    // Add the dots with tooltips
    var fixeddot = svg.selectAll('.dot2')
        .data(newData)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', 5)
        .attr('cx', function (d,i) { return x(i); })
        .attr('cy', function (d) { return y(d.maxMaxThisYear); })
        .on('mouseover', function (d) {
            div.transition().duration(200).style('opacity', 0.9);
            div.html(`<p class="highest"> <img src="./assets/temp_up.png"> ${d.maxMaxThisYear} </p>`)
               .style('left', d3.event.pageX + 'px')
               .style('top', d3.event.pageY - 28 + 'px');
        });

    var fixeddot2 = svg.selectAll('.dot2')
        .data(newData)
        .enter()
        .append('circle')
        .attr('class', 'dot2')
        .attr('r', 7)
        .attr('cx', function (d,i) { return x(i); })
        .attr('cy', function (d) { return y(d.avgMax); })
        .on('mouseover', function (d) {
            div.transition().duration(200).style('opacity', 0.9);
            div.html(`<p class="lowest"> <img src="./assets/temp_down.png">   ${d.avgMax} </p>`)
               .style('left', d3.event.pageX + 'px')
               .style('top', d3.event.pageY - 28 + 'px');
        });

    // Month labels
    var monthLabels = svg.selectAll('.month-label')
        .data(data.months)
        .enter()
        .append('text')
        .text(function(d) { return "Month " + d.month; }) // Modify this to your actual month labels
        .attr('class', 'month-label')
        .attr('x', function(d, i) { return x(i * 30); }) // Adjust the position based on your data
        .attr('y', height + 20) // Adjust the position based on your preference
        .style('text-anchor', 'middle')
        .style('font-size', '12px');

    // Add the X Axis
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .style('stroke-dasharray', '2 2')
        .call(d3.axisBottom(x).ticks(60));

    // Add the Y Axis and grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));

    var yscale = d3.scaleLinear().domain([0, 100]).range([height - 50, 0]);
    var y_axis = d3.axisRight(yscale);

    svg.append('g')
        .select('.domain')
        .attr('transform', 'translate(100,10)')
        .attr('stroke-width', 0)
        .call(y_axis);
});
