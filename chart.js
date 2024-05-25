const CURRENT_MONTH = new Date().getMonth() + 1;

// Set the dimensions and margins of the graph
const MARGIN = { top: 20, right: 50, bottom: 30, left: 50 }; // Adjust right margin to fit y-axis
const WIDTH = 3800 - MARGIN.left - MARGIN.right;
const HEIGHT = 500 - MARGIN.top - MARGIN.bottom;

// Append the chart div
const CHART_CONTAINER = d3
    .select('#chart')
    .append('div')
    .style('position', 'relative')
    .style('width', 'fit-content')
    .style('margin', '0 auto')
    .style('-webkit-overflow-scrolling', 'touch');

// Append the SVG object to the chart div
const SCROLLABLE_DIV = CHART_CONTAINER
    .append('div')
    .attr('id', 'scroll-div')
    .style('width', 700 + MARGIN.left + MARGIN.right + 'px')
    .style('overflow-x', 'scroll');

const SCROLLABLE_DIV_SVG_G = SCROLLABLE_DIV
    .append('svg')
    .attr('width', WIDTH + MARGIN.left + MARGIN.right - 100)
    .attr('height', HEIGHT + MARGIN.top + MARGIN.bottom + 70)
    .style('display', 'block')
    .append('g')
    .style('justify-content', 'flex-end')
    .attr('transform', 'translate(' + 0 + ',' + MARGIN.top + ')');



// Set the ranges
const x = d3.scaleLinear().range([0, WIDTH]);
const y = d3.scaleLinear().range([HEIGHT, 0]);

// Load data from JSON file
d3.json('temp.json', function (error, data) {
    if (error) throw error;

    const allDays = [];
    data.months.forEach((eachMonth, i) => {
        if (CURRENT_MONTH - 4 <= eachMonth.month && eachMonth.month <= CURRENT_MONTH) {
            eachMonth.days.forEach((eachDay, j) => {
                const date = createDateFromMonthAndDay(eachMonth.month, eachDay.day);
                eachDay.date = date;
            })
            allDays.push(...eachMonth.days);
        }
    });
    const newData = allDays;

    // Scale the range of the data
    x.domain(
        d3.extent(newData, function (d, i) {
            return d.date;
        })
    );
    y.domain([
        -10,
        d3.max(newData, function (d) {
            return Math.max(d.maxMaxThisYear, d.avgMax);
        }),
    ]);

    // Add the red area
    SCROLLABLE_DIV_SVG_G
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
                .x(function (d, _i) {
                    return x(d.date);
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
    SCROLLABLE_DIV_SVG_G
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
                    return x(d.date);
                })
                .y0(HEIGHT)
                .y1(function (d) {
                    return y(d.avgMax - 0.1);
                })
        );

    // Define the line generator function
    function lineGenerator() {
        return d3.line().x(function (d, i) {
            return x(d.date);
        });
    }

    // Define line generators for different datasets
    const valueline = lineGenerator().y(function (d) {
        if (typeof d.maxMaxThisYear === 'number') {
            return y(d.maxMaxThisYear);
        }
    });
    const valueline2 = lineGenerator().y(function (d) {
        return y(d.avgMax);
    });

    // Create a tooltip div
    const div = CHART_CONTAINER.append('div').attr('class', 'tooltip').style('opacity', 0);

    // Add the valueline paths
    const dataArray = [
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

    const legend = CHART_CONTAINER
        .append('svg')
        .style('width', 700 + MARGIN.left + MARGIN.right + 'px')
        .style('height', '32px')

    for (let i = 0; i < dataArray.length; i++) {
        legend
            .append('text')
            .text(dataArray[i].name)
            .attr('x', dataArray[i].x)
            .attr('y', 30)
            .attr('class', 'label-text');
        legend
            .append('rect')
            .attr('x', dataArray[i].x - 70)
            .attr('y', 12)
            .attr('width', 50)
            .attr('height', 10)
            .attr('class', dataArray[i].class);
        SCROLLABLE_DIV_SVG_G
            .append('path')
            .data([newData])
            .attr('class', dataArray[i].class2)
            .attr('d', dataArray[i].dataline);
    }

    // Add the dots with tooltips
    SCROLLABLE_DIV_SVG_G
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

    SCROLLABLE_DIV_SVG_G
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
    SCROLLABLE_DIV_SVG_G
        .selectAll('.month-label')
        .data(data.months)
        .enter()
        .append('text')
        .attr('class', 'month-label')
        .text(function (d) {
            // Define an array of month names
            const monthNames = [
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
        .attr('y', HEIGHT + 90);

    const marginTop = 20; // Define the top margin

    // Add the background rectangle for the X axis
    SCROLLABLE_DIV_SVG_G
        .append('rect')
        .attr('x', 0)
        .attr('y', HEIGHT + marginTop)
        .attr('width', WIDTH)
        .attr('height', 40) // Adjust the height to fit your needs
        .attr('fill', '#999999');

    // Add the dotted X Axis
    SCROLLABLE_DIV_SVG_G
        .append('g')
        .attr('transform', 'translate(0,' + (HEIGHT + 10) + ')')
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
    SCROLLABLE_DIV_SVG_G
        .append('g')
        .attr('transform', 'translate(0,' + (HEIGHT + marginTop) + ')')
        .style('color', 'white') // Change to 'black' or any color that contrasts with white
        .attr('class', 'num-axis x-axis')
        .call(d3.axisBottom(x)
            .ticks(25) // x axis tick count // where 25 means 25% visible and 75% hidden 
            .tickFormat(d3.timeFormat("%d"))) // "%d-%m-%Y"
        .call((g) => {
            g.selectAll('line')
                .attr('stroke', 'none') // Hide tick lines
            g.selectAll('text')
                .attr('fill', 'white')
        });

    // Add the month to X Axis
    SCROLLABLE_DIV_SVG_G
        .append('g')
        .attr('transform', 'translate(0,' + (HEIGHT + marginTop + 40) + ')')
        .style('color', 'white') // Change to 'black' or any color that contrasts with white
        .attr('class', 'num-axis x-axis')
        .call(d3.axisBottom(x)
            .ticks(5) // x axis tick count // where 25 means 25% visible and 75% hidden 
            .tickFormat(d3.timeFormat("%b"))) // "%d-%m-%Y"
        .call((g) => {
            g.selectAll('line')
                .attr('stroke', 'none') // Hide tick lines
            g.selectAll('text')
                .attr('fill', 'gray')
        });

    // Add the Y Axis and grid lines
    SCROLLABLE_DIV_SVG_G
        .append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y).tickSize(-WIDTH).tickFormat(''));

    // Add the right Y Axis
    CHART_CONTAINER
        .append("svg")
        .attr("width", "850px")
        .style("height", "100%")
        .style("position", "absolute")
        .style("top", "0")
        .style("left", "0")
        .style("pointer-events", "none")
        .style("z-index", 1)
        .append('g')
        .attr('transform', 'translate(' + (800) + ',  20)')
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

    // d3.select('#scroll-div').node().scrollBy(WIDTH, 0);
});




// Function to create a date from month number and day number
function createDateFromMonthAndDay(month, day, year = new Date().getFullYear()) {
    // Adjust the month number (0-based index)
    const adjustedMonth = month - 1;

    // Create the date object
    const date = new Date(year, adjustedMonth, day);

    return date;
}