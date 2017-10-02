import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import * as d3 from 'd3';

const jsonUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

class App extends Component {
  componentDidMount() {
    fetch(jsonUrl)
    .then(res => { return res.json(); })
    .then( res => {
      console.log(res);
      this.drawHeatMap(res);
    });
  }

  drawHeatMap(data) {
    const margin = { top: 5, right: 0, bottom: 90, left: 100 },
          width = 1200 - margin.left - margin.right,
          height = 550 - margin.top - margin.bottom,
          legendElementWidth = 35,
          colors = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"],
          buckets = colors.length,
          months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          gridSize = (width / data.monthlyVariance.length + 40) / 10,
          gridHeight = height / months.length

    const div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const svg = d3.select("#heat-map").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (margin.left-20) + "," + margin.top + ")");

    const x = d3.scaleTime().range([0, width]);
    
    const y = d3.scaleLinear().range([height, 0]);

    svg.append('g')
       .selectAll('text')
       .data(months)
       .enter()
       .append('text')
       .attr('class', 'months')
       .attr('x', function(d) {
         return ''+ -10;
       })
       .attr('y', function(d, i) {
         return '' + (i * gridHeight);
       })
       .attr('text-anchor', 'end').text(function (d) {
        return '' + d;
      })
      .attr("transform", "translate(-6," + gridHeight / 1.5 + ")");

    const date = function date(year) {
      return new Date(Date.parse(year));
    }

    x.domain([date(data.monthlyVariance[0].year), date(data.monthlyVariance[data.monthlyVariance.length - 1].year)]);
    y.domain([0, 12]);

    const xTicks = x.ticks().concat(new Date(data.monthlyVariance[data.monthlyVariance.length - 1].year, 0));

    svg.append('g')
       .attr('transform', 'translate(0,' + (height+7) + ')')
       .attr('class', 'color-wrapper')
       .call(d3.axisBottom(x).tickValues(xTicks));

    const colorScale = d3.scaleQuantile()
      .domain([d3.min(data.monthlyVariance, function (d) {
        return d.variance;
      }) + data.baseTemperature, d3.max(data.monthlyVariance, function(d) {
        return d.variance;
      }) + data.baseTemperature])
      .range(colors);

    svg.selectAll(".bar")
        .data(data.monthlyVariance)
        .enter().append("rect")
        .attr('class', 'bar')
        .attr("x", (d) => { return x(new Date(d.year, 0))})
        .attr("y", (d) => { return y(d.month) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", gridSize)
        .attr("height", height / 10)
        .style("fill", (d) => { return colorScale(d.variance + data.baseTemperature) })
        .on("mouseover", function(d) {
          div.transition()
            .duration(100)
            .style("opacity", .9);
          div.html(
            "<span class='amount'>" + d.year + " - " + months[months.length-d.month] +"</span><br><span class='year'>" + (data.baseTemperature+d.variance).toFixed(3) + " °C</span><br><span class='year'>" + d.variance + " °C</span>")     
            .style("left", (d3.event.pageX + 5) + "px")             
            .style("top", (d3.event.pageY - 80) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
            .duration(100)
            .style("opacity", 0);
        });  

    const legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), (d) => { return d; });
    const legend_g = legend.enter().append("g")
        .attr("class", "legend");
    legend_g.append("rect")
      .attr("x", (d, i) => legendElementWidth * i)
      .attr("y", height+50)
      .attr("width", legendElementWidth)
      .attr("height", 15)
      .style("fill", (d, i) => { return colors[i] });
    legend_g.append("text")
      .attr("class", "mono")
      .text((d) => {
        return (Math.floor(d * 10) / 10)
      })
      .attr("x", (d, i) => legendElementWidth * i)
      .attr("y", height + 75);
    legend.exit().remove();
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Monthly Global Land-Surface Temperature</h1>
          <strong>1753 - 2015</strong>
        </header>
        <div className="App-intro">
          <p><small>Temperatures are in Celsius and reported as anomalies relative to the Jan 1951-Dec 1980 average.</small></p>
          <p><small>Estimated Jan 1951-Dec 1980 absolute temperature ℃: 8.66 +/- 0.07</small></p>
        </div>
        <div id="heat-map"></div>
      </div>
    );
  }
}

export default App;
