import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { Search, ChevronDown } from 'lucide-react';
import apiService from '../services/api';

const TeamGoalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [goals, setGoals] = useState<any[]>([]);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      try {
        const cycleResponse = await apiService.getActiveCycle();
        setActiveCycle(cycleResponse.data);

        const goalsResponse = await apiService.getTeamGoals(cycleResponse.data.id);
        setGoals(goalsResponse.data);
      } catch (err) {
        console.error('Failed to load team goals', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = 
      goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'ALL' || goal.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: goals.length,
    approved: goals.filter(g => g.status === 'APPROVED').length,
    submitted: goals.filter(g => g.status === 'SUBMITTED').length,
    draft: goals.filter(g => g.status === 'DRAFT').length
  };

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Team Goals</h1>
          <p className="text-slate-600 mt-1">Monitor and manage goals from your team members</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div>
              <p className="text-slate-600 text-sm">Total Goals</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.total}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-slate-600 text-sm">Approved</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-slate-600 text-sm">Submitted</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.submitted}</p>
            </div>
          </Card>
          <Card>
            <div>
              <p className="text-slate-600 text-sm">Draft</p>
              <p className="text-2xl font-bold text-slate-600 mt-1">{stats.draft}</p>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by goal title or employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <p className="text-center text-slate-600">Loading team goals...</p>
            </Card>
          ) : filteredGoals.length === 0 ? (
            <Card>
              <p className="text-center text-slate-600">No goals found</p>
            </Card>
          ) : (
            filteredGoals.map((goal) => (
              <Card key={goal.id} variant="elevated">
                <button
                  onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">{goal.title}</h3>
                        <Badge>{goal.status}</Badge>
                      </div>
                      <p className="text-slate-600 text-sm mb-2">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>👤 {goal.employee?.firstName} {goal.employee?.lastName}</span>
                        <span>⚖️ {goal.weightage}%</span>
                        <span>🎯 Target: {goal.target}</span>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${expandedId === goal.id ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expandedId === goal.id && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-600">Unit of Measurement</p>
                        <p className="font-semibold text-slate-900">{goal.unitOfMeasurement}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Thrust Area</p>
                        <p className="font-semibold text-slate-900">{goal.thrustArea}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-semibold text-slate-900">{goal.employee?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Created</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(goal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {goal.status === 'SUBMITTED' && (
                      <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => navigate('/approvals')}
                      >
                        Review & Approve Goal
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeamGoalsPage;
