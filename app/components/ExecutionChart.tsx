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
    // animationDuration: 1500,
    // animationEasing: 'cubicOut',
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: {
        color: '#1e293b',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      },
      padding: [10, 15],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); border-radius: 8px; backdrop-filter: blur(4px);',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#94a3b8',
          width: 1,
          type: 'dashed',
        },
      },
    },
    legend: {
      data: ['Success', 'Failure'],
      top: 0,
      right: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: '#64748b',
        fontSize: 12,
        fontFamily: 'Inter, sans-serif',
      },
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '5%',
      top: '15%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: data.map(item => item.time),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
          margin: 15,
        },
        splitLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
          fontFamily: 'Inter, sans-serif',
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed',
          },
        },
      },
    ],
    series: [
      {
        name: 'Success',
        type: 'line',
        smooth: 0.4,
        showSymbol: false,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#10b981', // Emerald 500
          shadowColor: 'rgba(16, 185, 129, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        itemStyle: {
          color: '#10b981',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(16, 185, 129, 0.25)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0)' },
            ],
          },
        },
        data: data.map(item => item.success),
      },
      {
        name: 'Failure',
        type: 'line',
        smooth: 0.4,
        showSymbol: false,
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#f43f5e', // Rose 500
          shadowColor: 'rgba(244, 63, 94, 0.3)',
          shadowBlur: 10,
          shadowOffsetY: 5,
        },
        itemStyle: {
          color: '#f43f5e',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(244, 63, 94, 0.25)' },
              { offset: 1, color: 'rgba(244, 63, 94, 0)' },
            ],
          },
        },
        data: data.map(item => item.failure),
      },
    ],
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group" data-testid="line-chart">
      {/* Decorative highlight */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary-100/50 transition-colors duration-500"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Execution Trend</h3>
          <p className="text-xs text-slate-500 font-medium">Last 24 hours performance</p>
        </div>
        <div className="flex gap-2">
          {/* Custom Legend dots could go here if we wanted to replace ECharts legend */}
        </div>
      </div>

      <div className="flex-grow w-full relative z-10">
        <ReactECharts
          option={option}
          style={{ height: '100%', width: '100%', minHeight: '300px' }}
        />
      </div>
    </div>
  );
};

export default ExecutionChart;