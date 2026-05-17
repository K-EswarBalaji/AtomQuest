import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import apiService from '../services/api';
import { useForm } from '../hooks/useForm';
import { Plus, AlertCircle } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeCycle, setActiveCycle] = useState<any>(null);
  const [totalWeightage, setTotalWeightage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { formData, errors, handleChange, setFieldValue, setFieldError, reset } = useForm({
    thrustArea: '',
    title: '',
    description: '',
    unitOfMeasurement: 'NUMERIC',
    target: '',
    weightage: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const cycleResponse = await apiService.getActiveCycle();
        setActiveCycle(cycleResponse.data);

        const goalsResponse = await apiService.getEmployeeGoals(undefined, cycleResponse.data.id);
        setGoals(goalsResponse.data);

        const total = goalsResponse.data.reduce((sum: number, goal: any) => sum + parseFloat(goal.weightage || 0), 0);
        setTotalWeightage(total);
      } catch (err) {
        console.error('Failed to load goals', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.thrustArea || !formData.title || !formData.target || !formData.weightage) {
      setFieldError('title', 'All fields are required');
      return;
    }

    const weightage = parseFloat(formData.weightage);
    if (weightage < 10) {
      setFieldError('weightage', 'Minimum weightage is 10%');
      return;
    }

    if (totalWeightage + weightage > 100) {
      setFieldError('weightage', `Total weightage cannot exceed 100% (Current: ${totalWeightage}%)`);
      return;
    }

    if (goals.length >= 8) {
      setFieldError('title', 'Maximum 8 goals allowed');
      return;
    }

    try {
      const response = await apiService.createGoal({
        ...formData,
        cycleId: activeCycle.id,
        target: parseFloat(formData.target),
        weightage
      });

      setGoals([...goals, response.data.goal]);
      setTotalWeightage(totalWeightage + weightage);
      reset();
      setShowForm(false);
    } catch (err: any) {
      setFieldError('title', err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleSubmitGoals = async () => {
    if (Math.abs(totalWeightage - 100) > 0.01) {
      setBanner({ type: 'error', text: `Total weightage must be 100%. Current: ${totalWeightage}%` });
      return;
    }

    setSubmitLoading(true);
    try {
      const draftGoals = goals.filter(g => g.status === 'DRAFT');
      await apiService.submitGoals(
        draftGoals.map(g => g.id),
        activeCycle.id
      );
      setBanner({ type: 'success', text: 'Goals submitted for approval!' });
      
      const goalsResponse = await apiService.getEmployeeGoals(undefined, activeCycle.id);
      setGoals(goalsResponse.data);
    } catch (err: any) {
      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to submit goals' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fadeIn">
        {banner && (
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {banner.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Goals</h1>
            <p className="text-slate-600 mt-1">Create and manage your performance goals</p>
          </div>
          {!showForm && (
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 w-full md:w-auto justify-center"
            >
              <Plus size={20} />
              New Goal
            </Button>
          )}
        </div>

        {/* Goal Creation Form */}
        {showForm && (
          <Card title="Create New Goal">
            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Thrust Area"
                  name="thrustArea"
                  value={formData.thrustArea}
                  onChange={handleChange}
                  error={errors.thrustArea}
                  options={[
                    { value: 'SALES', label: 'Sales & Revenue' },
                    { value: 'OPERATIONS', label: 'Operations' },
                    { value: 'PRODUCT', label: 'Product' },
                    { value: 'CUSTOMER', label: 'Customer Experience' },
                    { value: 'TEAM', label: 'Team Development' },
                    { value: 'OTHER', label: 'Other' }
                  ]}
                />

                <Select
                  label="Unit of Measurement"
                  name="unitOfMeasurement"
                  value={formData.unitOfMeasurement}
                  onChange={handleChange}
                  options={[
                    { value: 'NUMERIC', label: 'Numeric (Higher is Better)' },
                    { value: 'PERCENTAGE', label: 'Percentage' },
                    { value: 'TIMELINE', label: 'Timeline / Date' },
                    { value: 'ZERO_BASED', label: 'Zero-based (0 = Success)' }
                  ]}
                />
              </div>

              <Input
                label="Goal Title"
                name="title"
                placeholder="e.g., Increase Sales by 20%"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
              />

              <textarea
                name="description"
                placeholder="Goal description and key milestones..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target"
                  name="target"
                  type="number"
                  placeholder="100"
                  value={formData.target}
                  onChange={handleChange}
                  error={errors.target}
                />

                <Input
                  label="Weightage (%)"
                  name="weightage"
                  type="number"
                  placeholder="e.g., 25"
                  value={formData.weightage}
                  onChange={handleChange}
                  error={errors.weightage}
                  min="10"
                  max="100"
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="primary">Create Goal</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Weightage Summary */}
        {goals.length > 0 && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Weightage</p>
                <p className={`text-2xl font-bold mt-1 ${Math.abs(totalWeightage - 100) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
                  {totalWeightage.toFixed(2)}%
                </p>
              </div>
              <div className={`text-right ${Math.abs(totalWeightage - 100) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
                {Math.abs(totalWeightage - 100) < 0.01 ? (
                  <p className="text-sm font-medium">✓ Perfect!</p>
                ) : (
                  <p className="text-sm font-medium">Needs adjustment: {(100 - totalWeightage).toFixed(2)}%</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Goals List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-200 h-32 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {goals.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-slate-600 mb-4">No goals created yet. Start by creating your first goal!</p>
                  <Button variant="primary" onClick={() => setShowForm(true)}>
                    <Plus size={20} className="inline mr-2" />
                    Create Goal
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {goals.map((goal) => (
                    <Card key={goal.id}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{goal.title}</h3>
                            <Badge variant={goal.status === 'DRAFT' ? 'default' : goal.status === 'SUBMITTED' ? 'info' : 'success'}>
                              {goal.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Thrust Area</p>
                              <p className="font-medium">{goal.thrustArea}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Target</p>
                              <p className="font-medium">{goal.target} ({goal.unitOfMeasurement})</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Weightage</p>
                              <p className="font-medium">{goal.weightage}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {goals.some(g => g.status === 'DRAFT') && Math.abs(totalWeightage - 100) < 0.01 && (
                  <Button
                    variant="primary"
                    onClick={handleSubmitGoals}
                    isLoading={submitLoading}
                    className="w-full"
                  >
                    Submit Goals for Approval
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default GoalsPage;
