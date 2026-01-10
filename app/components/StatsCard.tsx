'use client';
import React from 'react';
import { ExecutionStats } from '../data/testData';

interface StatsCardProps {
  title: string;
  stats: ExecutionStats[];
}

const StatsCard: React.FC<StatsCardProps> = ({ title, stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time Range</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Success Count</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Failure Count</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Total Count</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stats.map((stat, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="px-4 py-3 text-sm text-gray-900">{stat.timeRange}</td>
                <td className="px-4 py-3 text-sm text-green-600 font-medium">{stat.successCount}</td>
                <td className="px-4 py-3 text-sm text-red-600 font-medium">{stat.failureCount}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {stat.successCount + stat.failureCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StatsCard;