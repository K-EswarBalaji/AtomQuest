import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import { useAuthStore } from '../context/authStore';
import apiService from '../services/api';
import { TrendingUp, MessageSquare } from 'lucide-react';

const CheckInPage: React.FC = () => {
  const { user } = useAuthStore();
  const isManagerView = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  const [goals, setGoals] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, any>>({});
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [managerComments, setManagerComments] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const cycleResponse = await apiService.getActiveCycle();
        setActiveCycle(cycleResponse.data);

        if (isManagerView) {
          const [goalsResponse, checkInsResponse] = await Promise.all([
            apiService.getTeamGoals(cycleResponse.data.id),
            apiService.getCheckIns(undefined, cycleResponse.data.id)
          ]);

          setGoals(goalsResponse.data);

          const checkInsByGoal: Record<string, any> = {};
          const commentDrafts: Record<string, string> = {};
          checkInsResponse.data.forEach((ci: any) => {
            checkInsByGoal[ci.goalId] = ci;
            commentDrafts[ci.id] = ci.managerComment || '';
          });
          setCheckIns(checkInsByGoal);
          setManagerComments(commentDrafts);
        } else {
          const goalsResponse = await apiService.getEmployeeGoals(undefined, cycleResponse.data.id);
          setGoals(goalsResponse.data.filter((g: any) => g.status === 'APPROVED'));

          const checkInsResponse = await apiService.getCheckIns(undefined, cycleResponse.data.id);
          const checkInsByGoal: Record<string, any> = {};
          checkInsResponse.data.forEach((ci: any) => {
            checkInsByGoal[ci.goalId] = ci;
          });
          setCheckIns(checkInsByGoal);
        }
      } catch (err) {
        console.error('Failed to load check-in data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isManagerView]);

  const handleSubmitCheckIn = async (goalId: string, actualAchievement: string, status: string, comment: string) => {
    if (!activeCycle) {
      setBanner({ type: 'error', text: 'Active cycle is not available' });
      return;
    }

    if (!actualAchievement) {
      setBanner({ type: 'error', text: 'Please enter actual achievement' });
      return;
    }

    setSubmitting(prev => ({ ...prev, [goalId]: true }));
    try {
      await apiService.createCheckIn({
        goalId,
        cycleId: activeCycle.id,
        actualAchievement: parseFloat(actualAchievement),
        status,
        comment
      });

      const checkInsResponse = await apiService.getCheckIns(undefined, activeCycle.id);
      const checkInsByGoal: Record<string, any> = {};
      checkInsResponse.data.forEach((ci: any) => {
        checkInsByGoal[ci.goalId] = ci;
      });
      setCheckIns(checkInsByGoal);
      setBanner({ type: 'success', text: 'Check-in submitted successfully!' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to submit check-in' });
    } finally {
      setSubmitting(prev => ({ ...prev, [goalId]: false }));
    }
  };

  const handleSaveManagerComment = async (checkInId: string) => {
    const comment = (managerComments[checkInId] || '').trim();

    if (!comment) {
      setBanner({ type: 'error', text: 'Please enter a manager comment' });
      return;
    }

    setSubmitting(prev => ({ ...prev, [checkInId]: true }));
    try {
      await apiService.addManagerComment(checkInId, comment);

      if (!activeCycle) return;

      const [goalsResponse, checkInsResponse] = await Promise.all([
        apiService.getTeamGoals(activeCycle.id),
        apiService.getCheckIns(undefined, activeCycle.id)
      ]);

      setGoals(goalsResponse.data);

      const checkInsByGoal: Record<string, any> = {};
      const commentDrafts: Record<string, string> = {};
      checkInsResponse.data.forEach((ci: any) => {
        checkInsByGoal[ci.goalId] = ci;
        commentDrafts[ci.id] = ci.managerComment || '';
      });
      setCheckIns(checkInsByGoal);
      setManagerComments(commentDrafts);

      setBanner({ type: 'success', text: 'Manager comment saved successfully!' });
    } catch (err: any) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to save manager comment' });
    } finally {
      setSubmitting(prev => ({ ...prev, [checkInId]: false }));
    }
  };

  const calculateProgress = (actual: number, target: number, uom: string) => {
    if (uom === 'NUMERIC' || uom === 'PERCENTAGE') {
      return Math.min(100, (actual / target) * 100);
    }
    return 0;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {banner && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {banner.text}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isManagerView ? 'Team Check-ins' : 'Quarterly Check-ins'}
          </h1>
          <p className="text-slate-600 mt-1">
            {isManagerView
              ? 'Review team updates and leave manager feedback on submitted check-ins'
              : 'Update your actual achievement against planned targets'}
          </p>
        </div>

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
                  <p className="text-slate-600">
                    {isManagerView ? 'No team goals found for the current cycle' : 'No approved goals to update'}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => {
                  const checkIn = checkIns[goal.id];
                  const progress = checkIn ? calculateProgress(checkIn.actualAchievement, goal.target, goal.unitOfMeasurement) : 0;

                  return (
                    <Card key={goal.id}>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">{goal.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Target</p>
                            <p className="font-medium">{goal.target}</p>
                          </div>
                          {checkIn && (
                            <>
                              <div>
                                <p className="text-slate-500">Actual</p>
                                <p className="font-medium">{checkIn.actualAchievement}</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Progress</p>
                                <p className="font-medium">{progress.toFixed(1)}%</p>
                              </div>
                              <div>
                                <p className="text-slate-500">Status</p>
                                <Badge variant={checkIn.status === 'COMPLETED' ? 'success' : 'info'}>
                                  {checkIn.status}
                                </Badge>
                              </div>
                            </>
                          )}
                        </div>

                        {isManagerView ? (
                          <ManagerCommentPanel
                            goal={goal}
                            checkIn={checkIn}
                            comment={checkIn ? managerComments[checkIn.id] || checkIn.managerComment || '' : ''}
                            onCommentChange={(value) => {
                              if (checkIn) {
                                setManagerComments(prev => ({ ...prev, [checkIn.id]: value }));
                              }
                            }}
                            onSave={() => checkIn && handleSaveManagerComment(checkIn.id)}
                            isSubmitting={checkIn ? !!submitting[checkIn.id] : false}
                          />
                        ) : !checkIn && (
                          <CheckInForm
                            goalId={goal.id}
                            onSubmit={(actual, status, comment) =>
                              handleSubmitCheckIn(goal.id, actual, status, comment)
                            }
                            isSubmitting={submitting[goal.id] || false}
                          />
                        )}

                        {checkIn && checkIn.managerComment && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                              <div>
                                <p className="text-sm font-medium text-blue-900">Manager Feedback</p>
                                <p className="text-sm text-blue-800 mt-1">{checkIn.managerComment}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

interface CheckInFormProps {
  goalId: string;
  onSubmit: (actual: string, status: string, comment: string) => void;
  isSubmitting: boolean;
}

interface ManagerCommentPanelProps {
  goal: any;
  checkIn: any;
  comment: string;
  onCommentChange: (value: string) => void;
  onSave: () => void;
  isSubmitting: boolean;
}

const ManagerCommentPanel: React.FC<ManagerCommentPanelProps> = ({
  goal,
  checkIn,
  comment,
  onCommentChange,
  onSave,
  isSubmitting
}) => {
  if (!checkIn) {
    return (
      <div className="pt-3 border-t border-slate-200">
        <p className="text-sm text-slate-600">
          No check-in submitted yet for {goal.employee?.firstName} {goal.employee?.lastName}.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-slate-500">Employee</p>
          <p className="font-medium">{goal.employee?.firstName} {goal.employee?.lastName}</p>
        </div>
        <div>
          <p className="text-slate-500">Check-in Status</p>
          <Badge variant={checkIn.status === 'COMPLETED' ? 'success' : 'info'}>{checkIn.status}</Badge>
        </div>
        <div>
          <p className="text-slate-500">Actual Achievement</p>
          <p className="font-medium">{checkIn.actualAchievement}</p>
        </div>
        <div>
          <p className="text-slate-500">Manager Feedback</p>
          <p className="font-medium">{checkIn.managerComment ? 'Saved' : 'Pending'}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Manager Comment</label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add feedback or next steps for this check-in..."
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={3}
        />
      </div>

      <Button
        variant="primary"
        onClick={onSave}
        isLoading={isSubmitting}
        className="w-full"
      >
        Save Manager Comment
      </Button>
    </div>
  );
};

const CheckInForm: React.FC<CheckInFormProps> = ({ goalId, onSubmit, isSubmitting }) => {
  const [actual, setActual] = useState('');
  const [status, setStatus] = useState('ON_TRACK');
  const [comment, setComment] = useState('');

  return (
    <div className="space-y-3 pt-3 border-t border-slate-200">
      <Input
        label="Actual Achievement"
        type="number"
        placeholder="Enter actual achievement"
        value={actual}
        onChange={(e) => setActual(e.target.value)}
      />

      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        options={[
          { value: 'NOT_STARTED', label: 'Not Started' },
          { value: 'ON_TRACK', label: 'On Track' },
          { value: 'COMPLETED', label: 'Completed' },
          { value: 'AT_RISK', label: 'At Risk' }
        ]}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Comment (Optional)</label>
        <textarea
          placeholder="Add any comments or notes..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={2}
        />
      </div>

      <Button
        variant="primary"
        onClick={() => onSubmit(actual, status, comment)}
        isLoading={isSubmitting}
        className="w-full flex items-center justify-center gap-2"
      >
        <TrendingUp size={18} />
        Submit Check-in
      </Button>
    </div>
  );
};

export default CheckInPage;
