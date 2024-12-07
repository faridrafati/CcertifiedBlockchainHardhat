import React, { Component } from 'react';
import Chart from 'react-apexcharts'

class ChartUpdate extends Component {

    state = {
      options: {
        chart: {
          id: 'basic-bar',
        },
        xaxis: {
          categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
      },
      series: [{
        name: 'series-2',
        type: 'column',
        data: [23, 12, 54, 61, 32, 56, 81, 19]
      }],

    }

  updateCharts = () => {
    const max = 90;
    const min = 30;
    const newSeries = [];
    this.state.series.forEach((s) => {
      const data = s.data.map(() => {
        return Math.floor(Math.random() * (max - min + 1)) + min
      })
      newSeries.push({ data: data, type: s.type })
    })



    this.setState({
      series: newSeries,
    })
  }

  render() {

    return (
      <div className="app">
        
        <div className="row">
          <div className="col">
            <Chart options={this.state.options} series={this.state.series} type="line" width="500" />
          </div>
          
           <p className="col">
            <button onClick={this.updateCharts}>Update!</button>
          </p>
        </div>
      </div>
    );
  }
}

export default ChartUpdate;