import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import apiService from '../services/api';
import { ChevronDown, CheckCircle, X } from 'lucide-react';

const ApprovalsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approvalData, setApprovalData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await apiService.getTeamGoals(undefined, 'SUBMITTED');
      setGoals(response.data);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (goalId: string, targetAdjustment?: number) => {
    setSubmitting(prev => ({ ...prev, [goalId]: true }));
    try {
      await apiService.approveGoal(goalId, true, undefined, targetAdjustment);
      // Refresh the goals list after approval
      await loadGoals();
      setExpandedId(null);
      setApprovalData(prev => ({ ...prev, [goalId]: {} }));
    } catch (err: any) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to approve goal' });
    } finally {
      setSubmitting(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const handleReject = async (goalId: string) => {
    const reason = approvalData[goalId]?.rejectionReason?.trim();
    if (!reason) {
      setBanner({ type: 'error', text: 'Please enter a rejection reason before rejecting.' });
      return;
    }

    setSubmitting(prev => ({ ...prev, [goalId]: true }));
    try {
      await apiService.approveGoal(goalId, false, reason);
      // Refresh the goals list after rejection
      await loadGoals();
      setExpandedId(null);
    } catch (err: any) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to reject goal' });
    } finally {
      setSubmitting(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const pendingCount = goals.filter(g => g.status === 'SUBMITTED').length;

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn">
        {banner && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {banner.text}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">Goal Approvals</h1>
          <p className="text-slate-600 mt-1">Review and approve goals from your team members</p>
        </div>

        {/* Summary Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{pendingCount}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-sm">Total Goals</p>
              <p className="text-3xl font-bold text-slate-600 mt-2">{goals.length}</p>
            </div>
          </div>
        </Card>

        {/* Goals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {goals.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-slate-600">No goals pending approval</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card key={goal.id}>
                    <div
                      className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setExpandedId(expandedId === goal.id ? null : goal.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{goal.title}</h3>
                          <Badge variant={goal.status === 'SUBMITTED' ? 'warning' : 'success'}>
                            {goal.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">
                          From: <strong>{goal.employee?.firstName} {goal.employee?.lastName}</strong>
                        </p>
                      </div>
                      <ChevronDown
                        className={`transition-transform ${expandedId === goal.id ? 'rotate-180' : ''}`}
                        size={20}
                      />
                    </div>

                    {expandedId === goal.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                        <div>
                          <p className="text-sm text-slate-600">Description</p>
                          <p className="text-slate-900 mt-1">{goal.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-slate-600">Thrust Area</p>
                            <p className="font-medium">{goal.thrustArea}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Target</p>
                            <p className="font-medium">{goal.target} ({goal.unitOfMeasurement})</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-600">Weightage</p>
                            <p className="font-medium">{goal.weightage}%</p>
                          </div>
                        </div>

                        {goal.status === 'SUBMITTED' && (
                          <div className="space-y-3 pt-4 border-t border-slate-200">
                            <div>
                              <label className="text-sm text-slate-600 block mb-1">
                                Adjust Target (Optional)
                              </label>
                              <Input
                                type="number"
                                placeholder={goal.target}
                                onChange={(e) => setApprovalData(prev => ({
                                  ...prev,
                                  [goal.id]: { targetAdjustment: e.target.value }
                                }))}
                              />
                            </div>

                            <div>
                              <label className="text-sm text-slate-600 block mb-1">
                                Rejection Reason (Required to reject)
                              </label>
                              <textarea
                                value={approvalData[goal.id]?.rejectionReason || ''}
                                onChange={(e) => setApprovalData(prev => ({
                                  ...prev,
                                  [goal.id]: {
                                    ...prev[goal.id],
                                    rejectionReason: e.target.value
                                  }
                                }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                                rows={3}
                                placeholder="Explain why this goal is being rejected"
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="success"
                                onClick={() => handleApprove(goal.id, approvalData[goal.id]?.targetAdjustment ? parseFloat(approvalData[goal.id].targetAdjustment) : undefined)}
                                isLoading={submitting[goal.id]}
                                className="flex-1 flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={18} />
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => handleReject(goal.id)}
                                isLoading={submitting[goal.id]}
                                className="flex-1 flex items-center justify-center gap-2"
                              >
                                <X size={18} />
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalsPage;
