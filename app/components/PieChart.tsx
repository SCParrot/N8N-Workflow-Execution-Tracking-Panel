'use client';
import React, { useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { TimeRangeStats } from '../data/testData';

interface PieChartProps {
  data: TimeRangeStats;
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState<number>(0);

  // Get container width for responsive chart adjustment
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
      }
    };

    // Initial update
    updateWidth();
    
    // Add window resize listener
    window.addEventListener('resize', updateWidth);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Adjust chart options based on screen width
  const getChartOption = () => {
    // Responsive configuration
    const isMobile = chartWidth < 640;
    const isSmallScreen = chartWidth < 768;
    
    return {
      animation: false,
      title: {
        text: data.name,
        left: 'center',
        textStyle: {
          fontSize: isMobile ? 16 : 14,
          fontWeight: 'bold',
          color: '#333',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: isMobile ? 'horizontal' : 'vertical',
        right: isMobile ? 'center' : 10,
        top: isMobile ? '85%' : 'center',
        bottom: isMobile ? 10 : 'auto',
        textStyle: {
          fontSize: isMobile ? 14 : 12,
        },
        formatter: function(name: string) {
          if (name === 'Success') {
            return `${name}: ${data.success}`;
          } else if (name === 'Failure') {
            return `${name}: ${data.failure}`;
          }
          return name;
        },
      },
      series: [
        {
          name: 'Execution Result',
          type: 'pie',
          animation: false,
          radius: isMobile ? ['35%', '75%'] : ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 1,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: false,
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            {
              value: data.success,
              name: 'Success',
              itemStyle: {
                color: '#52c41a',
              },
            },
            {
              value: data.failure,
              name: 'Failure',
              itemStyle: {
                color: '#ff4d4f',
              },
            },
          ],
          center: ['50%', isMobile ? '45%' : '50%'],
        },
      ],
    };
  };

  // Responsive configuration
  const isMobile = chartWidth < 640;

  return (
    <div ref={containerRef} className="bg-white rounded-lg shadow-lg p-2 sm:p-4 h-full" data-testid="pie-chart">
      {isMobile ? (
        // Mobile: Show only statistics
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">{data.name}</h3>
          <div className="flex justify-center gap-8 w-full">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{data.success}</div>
              <div className="text-sm text-gray-600">Success</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{data.failure}</div>
              <div className="text-sm text-gray-600">Failure</div>
            </div>
          </div>
        </div>
      ) : (
        // PC: Show full pie chart
        <ReactECharts option={getChartOption()} style={{ height: '100%', width: '100%' }} />
      )}
    </div>
  );
};

export default PieChart;