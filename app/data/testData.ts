export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'success' | 'error';
  startedAt: string;
  finishedAt: string;
}

export interface ExecutionStats {
  timeRange: string;
  successCount: number;
  failureCount: number;
}

export interface TimeRangeStats {
  name: string;
  success: number;
  failure: number;
  total: number;
}

export interface ChartData {
  time: string;
  success: number;
  failure: number;
}

// Generate mock workflow list
export const generateTestWorkflows = (): Workflow[] => {
  const workflows: Workflow[] = [
    {
      id: 'workflow-1',
      name: 'Data Sync Workflow',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workflow-2',
      name: 'Email Notification Workflow',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workflow-3',
      name: 'Scheduled Backup Workflow',
      active: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'workflow-4',
      name: 'API Monitoring Workflow',
      active: true,
      createdAt: new Date().toISOString(),
    },
  ];

  // Add more fake workflows
  for (let i = 5; i <= 15; i++) {
    workflows.push({
      id: `workflow-${i}`,
      name: `Automated Task ${i} - ${['Sales', 'Marketing', 'DevOps', 'HR', 'Finance'][Math.floor(Math.random() * 5)]}`,
      active: true,
      createdAt: new Date().toISOString(),
    });
  }

  return workflows;
};

// Generate test data
export const generateTestData = (workflowId?: string): WorkflowExecution[] => {
  const executions: WorkflowExecution[] = [];
  const now = new Date();
  const workflows = generateTestWorkflows();
  const targetWorkflowId = workflowId || workflows[0].id;

  // Generate data for the last 24 hours, one execution record every 10 minutes
  for (let i = 0; i < 144; i++) {
    const startTime = new Date(now.getTime() - i * 10 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + Math.random() * 60 * 1000);

    // Generate data for all workflows or only for the specified workflow
    if (!workflowId) {
      // Generate data for each workflow
      workflows.forEach(wf => {
        executions.push({
          id: `exec-${wf.id}-${i}`,
          workflowId: wf.id,
          status: Math.random() > 0.2 ? 'success' : 'error', // 80% success rate
          startedAt: startTime.toISOString(),
          finishedAt: endTime.toISOString(),
        });
      });
    } else {
      // Generate data only for the specified workflow
      executions.push({
        id: `exec-${targetWorkflowId}-${i}`,
        workflowId: targetWorkflowId,
        status: Math.random() > 0.2 ? 'success' : 'error', // 80% success rate
        startedAt: startTime.toISOString(),
        finishedAt: endTime.toISOString(),
      });
    }
  }

  return executions;
};

// Calculate statistics for different time ranges
export const calculateStats = (executions: WorkflowExecution[], workflowId?: string) => {
  const now = new Date();
  const stats: Record<string, TimeRangeStats> = {};

  // Filter data for the specified workflow
  const filteredExecutions = workflowId
    ? executions.filter(exec => exec.workflowId === workflowId)
    : executions;

  // Time range configuration
  const timeRanges = [
    { key: 'lastHour', name: 'Last 1 Hour', hours: 1 },
    { key: 'lastSixHours', name: 'Last 6 Hours', hours: 6 },
    { key: 'lastTwelveHours', name: 'Last 12 Hours', hours: 12 },
    { key: 'lastDay', name: 'Last 24 Hours', hours: 24 },
  ];

  for (const range of timeRanges) {
    const timeRangeStart = new Date(now.getTime() - range.hours * 60 * 60 * 1000);

    const rangeFiltered = filteredExecutions.filter(exec => {
      const execTime = new Date(exec.startedAt);
      return execTime >= timeRangeStart && execTime <= now;
    });

    const success = rangeFiltered.filter(exec => exec.status === 'success').length;
    const failure = rangeFiltered.filter(exec => exec.status === 'error').length;

    stats[range.key] = {
      name: range.name,
      success,
      failure,
      total: success + failure,
    };
  }

  return stats;
};

// Generate chart data for every half hour
export const generateChartData = (executions: WorkflowExecution[], workflowId?: string): ChartData[] => {
  const now = new Date();
  const chartData: ChartData[] = [];

  // Filter data for the specified workflow
  const filteredExecutions = workflowId
    ? executions.filter(exec => exec.workflowId === workflowId)
    : executions;

  // Generate data for the last 24 hours, every half hour
  for (let i = 48; i >= 0; i--) {
    const timeRangeStart = new Date(now.getTime() - i * 30 * 60 * 1000);
    const timeRangeEnd = new Date(timeRangeStart.getTime() + 30 * 60 * 1000);

    const filtered = filteredExecutions.filter(exec => {
      const execTime = new Date(exec.startedAt);
      return execTime >= timeRangeStart && execTime < timeRangeEnd;
    });

    chartData.push({
      time: `${timeRangeStart.getHours().toString().padStart(2, '0')}:${timeRangeStart.getMinutes().toString().padStart(2, '0')}`,
      success: filtered.filter(exec => exec.status === 'success').length,
      failure: filtered.filter(exec => exec.status === 'error').length,
    });
  }

  return chartData;
};

// Export functions, not direct execution results
// These functions will be called in client components to avoid accessing browser APIs during server-side rendering