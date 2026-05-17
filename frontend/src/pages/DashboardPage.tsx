import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { useAuthStore } from '../context/authStore';
import apiService from '../services/api';
import { BarChart3, Users, Target, CheckCircle, Calendar, TrendingUp, Zap, Clock } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cycleResponse = await apiService.getActiveCycle();
        setActiveCycle(cycleResponse.data);

        if (user?.role === 'EMPLOYEE') {
          const goalsResponse = await apiService.getEmployeeGoals(undefined, cycleResponse.data.id);
          const goals = goalsResponse.data;
          setStats({
            totalGoals: goals.length,
            approvedGoals: goals.filter((g: any) => g.status === 'APPROVED').length,
            submittedGoals: goals.filter((g: any) => g.status === 'SUBMITTED').length,
            draftGoals: goals.filter((g: any) => g.status === 'DRAFT').length
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="animate-slideInDown">
          <div className="mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, {user?.firstName}! 🚀
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            {user?.role === 'EMPLOYEE' && '📊 Track your goals and achieve excellence'}
            {user?.role === 'MANAGER' && '👥 Review and empower your team\'s growth'}
            {user?.role === 'ADMIN' && '⚙️ Manage the entire goal tracking system'}
          </p>
        </div>

        {/* Active Cycle Banner */}
        {activeCycle && (
          <Card variant="elevated" className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden relative animate-slideInUp">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-white opacity-5 rounded-full"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur">
                      <Calendar size={20} />
                    </div>
                    <h3 className="text-xl font-bold">Current Cycle</h3>
                  </div>
                  <p className="text-4xl font-bold mb-2">{activeCycle.name}</p>
                  <Badge variant="info" className="bg-white bg-opacity-20 text-white">{activeCycle.phase.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="md:text-right">
                  <p className="text-blue-100 text-sm mb-1">Current Period</p>
                  <p className="text-lg font-semibold">
                    {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="stat-card bg-gradient-to-br from-slate-200 to-slate-300 h-40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {user?.role === 'EMPLOYEE' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Total Goals</p>
                      <p className="text-4xl font-bold text-blue-600 mt-3">{stats.totalGoals}</p>
                      <p className="text-xs text-slate-500 mt-2">Across all statuses</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Target className="text-blue-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Approved</p>
                      <p className="text-4xl font-bold text-green-600 mt-3">{stats.approvedGoals}</p>
                      <p className="text-xs text-slate-500 mt-2">Ready to execute</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="text-green-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Pending Review</p>
                      <p className="text-4xl font-bold text-yellow-600 mt-3">{stats.submittedGoals}</p>
                      <p className="text-xs text-slate-500 mt-2">Awaiting approval</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Clock className="text-yellow-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Draft</p>
                      <p className="text-4xl font-bold text-slate-600 mt-3">{stats.draftGoals}</p>
                      <p className="text-xs text-slate-500 mt-2">In progress</p>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-lg">
                      <Zap className="text-slate-600" size={32} />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {user?.role === 'MANAGER' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Pending Approvals</p>
                      <p className="text-4xl font-bold text-blue-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">Awaiting your review</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <BarChart3 className="text-blue-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Team Members</p>
                      <p className="text-4xl font-bold text-purple-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">Directly reporting</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Users className="text-purple-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Check-in Status</p>
                      <p className="text-4xl font-bold text-green-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">Team progress</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="text-green-600" size={32} />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {user?.role === 'ADMIN' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Total Users</p>
                      <p className="text-4xl font-bold text-blue-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">System users</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Users className="text-blue-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Active Cycles</p>
                      <p className="text-4xl font-bold text-green-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">Running cycles</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Calendar className="text-green-600" size={32} />
                    </div>
                  </div>
                </Card>

                <Card variant="gradient" className="stat-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-semibold">Completion Rate</p>
                      <p className="text-4xl font-bold text-purple-600 mt-3">--</p>
                      <p className="text-xs text-slate-500 mt-2">Overall system</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <TrendingUp className="text-purple-600" size={32} />
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Quick Actions */}
        <Card title="⚡ Quick Actions" className="bg-gradient-to-br from-slate-50 to-white animate-slideInUp">
          <div className="flex flex-wrap gap-3">
            {user?.role === 'EMPLOYEE' && (
              <>
                <Button variant="primary" size="md" onClick={() => navigate('/goals')}>✨ Create New Goal</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/goals')}>📋 View My Goals</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/check-ins')}>✔️ Update Check-in</Button>
              </>
            )}
            {user?.role === 'MANAGER' && (
              <>
                <Button variant="primary" size="md" onClick={() => navigate('/team-goals')}>📝 Review Goals</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/check-ins')}>💬 Conduct Check-in</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/team-goals')}>👥 View Team</Button>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <Button variant="primary" size="md" onClick={() => navigate('/cycles')}>📅 Create New Cycle</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/users')}>👤 Manage Users</Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/reports')}>📊 Generate Reports</Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default DashboardPage;
