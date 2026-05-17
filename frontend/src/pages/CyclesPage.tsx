import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Plus, Edit2, Trash2, Calendar, Users, TrendingUp, CheckCircle } from 'lucide-react';
import apiService from '../services/api';

const CyclesPage: React.FC = () => {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', year: new Date().getFullYear(), phase: 'GOAL_SETTING', startDate: '', endDate: '', goalSubmissionDeadline: '', approvalDeadline: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiService.getCycles();
        setCycles(res.data);
      } catch (err) {
        console.error('Failed to load cycles', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Layout>
      <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fadeIn">
        {banner && (
          <div className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {banner.text}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Goal Cycles 📅
          </h1>
          <p className="text-slate-600 dark:text-slate-400">Manage performance cycles</p>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <Button variant="primary" onClick={() => { setEditing(null); setForm({ name: '', year: new Date().getFullYear(), phase: 'GOAL_SETTING', startDate: '', endDate: '', goalSubmissionDeadline: '', approvalDeadline: '' }); setShowModal(true); }}>
            <Plus size={18} />
            Create New Cycle
          </Button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">{editing ? 'Edit Cycle' : 'Create Cycle'}</h3>
              <div className="space-y-3">
                <input className="w-full p-2 border rounded" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="w-full p-2 border rounded" type="number" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} />
                <select className="w-full p-2 border rounded" value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}>
                  <option value="GOAL_SETTING">Goal Setting</option>
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4_ANNUAL">Q4 Annual</option>
                </select>
                <label className="text-sm">Start Date</label>
                <input className="w-full p-2 border rounded" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                <label className="text-sm">End Date</label>
                <input className="w-full p-2 border rounded" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={async () => {
                    try {
                      if (editing) {
                        await apiService.updateCycle(editing.id, form);
                        setBanner({ type: 'success', text: 'Cycle updated successfully.' });
                      } else {
                        await apiService.createCycle(form);
                        setBanner({ type: 'success', text: 'Cycle created successfully.' });
                      }
                      const res = await apiService.getCycles();
                      setCycles(res.data);
                      setShowModal(false);
                    } catch (err:any) {
                      setBanner({ type: 'error', text: err.response?.data?.message || 'Failed to save cycle' });
                    }
                  }}>{editing ? 'Save' : 'Create'}</button>
                  <button className="px-4 py-2 border rounded" onClick={() => setShowModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cycles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cycles.map((cycle) => (
            <Card key={cycle.id} variant="gradient">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cycle.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar size={14} />
                    {cycle.startDate} to {cycle.endDate}
                  </p>
                </div>
                <button className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors" onClick={() => {
                  const s = cycle.startDate ? cycle.startDate.substring(0,10) : '';
                  const e = cycle.endDate ? cycle.endDate.substring(0,10) : '';
                  setEditing(cycle);
                  setForm({ name: cycle.name || '', year: cycle.year || new Date().getFullYear(), phase: cycle.phase || 'GOAL_SETTING', startDate: s, endDate: e, goalSubmissionDeadline: cycle.goalSubmissionDeadline ? (cycle.goalSubmissionDeadline.substring?cycle.goalSubmissionDeadline.substring(0,10):'') : '', approvalDeadline: cycle.approvalDeadline ? (cycle.approvalDeadline.substring?cycle.approvalDeadline.substring(0,10):'') : '' });
                  setShowModal(true);
                }}>
                  <Edit2 size={18} className="text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <TrendingUp size={14} /> Goals
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{cycle.goalsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Users size={14} /> Users
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{cycle.usersCount}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completion</span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{cycle.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300"
                    style={{ width: `${cycle.progress}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cycle.status === 'Active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : cycle.status === 'Completed'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {cycle.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default CyclesPage;
