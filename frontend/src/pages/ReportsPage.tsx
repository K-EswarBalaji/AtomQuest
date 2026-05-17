import React from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Download, BarChart3, TrendingUp, Users, CheckCircle, AlertCircle } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const reports = [
    {
      id: 1,
      title: 'Goal Completion Summary',
      description: 'Overview of completed vs pending goals across all teams',
      status: 'Ready',
      lastUpdated: '2026-05-16',
      type: 'summary'
    },
    {
      id: 2,
      title: 'Individual Performance Report',
      description: 'Detailed performance metrics for each employee',
      status: 'Ready',
      lastUpdated: '2026-05-15',
      type: 'performance'
    },
    {
      id: 3,
      title: 'Team Progress Analysis',
      description: 'Team-wise goal progress and achievements',
      status: 'Generating',
      lastUpdated: '2026-05-14',
      type: 'team'
    },
    {
      id: 4,
      title: 'Cycle Insights Dashboard',
      description: 'Comprehensive cycle performance analytics',
      status: 'Ready',
      lastUpdated: '2026-05-13',
      type: 'analytics'
    }
  ];

  const downloadReport = (report: typeof reports[number]) => {
    const rows = [
      ['Title', report.title],
      ['Description', report.description],
      ['Status', report.status],
      ['Last Updated', report.lastUpdated],
      ['Type', report.type]
    ];

    const csv = rows.map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.type}-report.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Reports 📈
          </h1>
          <p className="text-slate-600 dark:text-slate-400">View and download analytics reports</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Goals</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">142</p>
              </div>
              <BarChart3 className="text-blue-600 dark:text-blue-400" size={28} />
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">98</p>
              </div>
              <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">35</p>
              </div>
              <TrendingUp className="text-purple-600 dark:text-purple-400" size={28} />
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Team Members</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">28</p>
              </div>
              <Users className="text-orange-600 dark:text-orange-400" size={28} />
            </div>
          </Card>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report) => (
            <Card key={report.id} variant="elevated">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{report.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{report.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">Last Updated: {report.lastUpdated}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'Ready'
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    {report.status}
                  </span>
                </div>
                {report.status === 'Ready' && (
                  <Button variant="secondary" onClick={() => downloadReport(report)}>
                    <Download size={18} />
                    Download
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
