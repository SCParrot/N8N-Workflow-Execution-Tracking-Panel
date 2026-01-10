'use client';
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { ChartData } from '../data/testData';

interface ExecutionChartProps {
  data: ChartData[];
}

const ExecutionChart: React.FC<ExecutionChartProps> = ({ data }) => {
  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985',
        },
      },
    },
    legend: {
      data: ['Success', 'Failure'],
      top: 10,
      left: 'center',
      textStyle: {
        fontSize: 12,
      },
    },
    // grid: {
    //   left: '3%',
    //   right: '4%',
    //   bottom: '3%',
    //   height:500,
    //   containLabel: true,
    // },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.time),
        axisLabel: {
          rotate: 45,
          fontSize: 10,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Execution Count',
        nameTextStyle: {
          fontSize: 12,
        },
        axisLabel: {
          fontSize: 10,
        },
      },
    ],
    series: [
      {
        name: 'Success',
        type: 'line',
        animation: false,
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#52c41a',
        },
        itemStyle: {
          color: '#52c41a',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(82, 196, 26, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(82, 196, 26, 0.05)',
              },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: data.map(item => item.success),
      },
      {
        name: 'Failure',
        type: 'line',
        animation: false,
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#ff4d4f',
        },
        itemStyle: {
          color: '#ff4d4f',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(255, 77, 79, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(255, 77, 79, 0.05)',
              },
            ],
          },
        },
        emphasis: {
          focus: 'series',
        },
        data: data.map(item => item.failure),
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col" data-testid="line-chart">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Execution Trend Chart (Every Half Hour)</h3>
      <div className="flex-grow">
        <ReactECharts option={option} style={{ height: '20rem', width: '100%' }} />
      </div>
    </div>
  );
};

export default ExecutionChart;