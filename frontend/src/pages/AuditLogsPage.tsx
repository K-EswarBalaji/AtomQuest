import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { Search, Filter, Clock, User, Activity, Trash2, Edit, Plus } from 'lucide-react';
import apiService from '../services/api';

const AuditLogsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await apiService.getAuditLogs();
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to load audit logs', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const filteredLogs = useMemo(
    () => logs.filter((log) => {
      const userName = `${log.User?.firstName || ''} ${log.User?.lastName || ''}`.trim().toLowerCase();
      const entityName = log.newValues?.name || log.newValues?.title || log.newValues?.entityName || log.entityId || '';
      const query = searchTerm.toLowerCase();
      const matchesSearch = userName.includes(query)
        || String(entityName).toLowerCase().includes(query)
        || log.action.toLowerCase().includes(query)
        || log.entityType.toLowerCase().includes(query)
        || String(log.reason || '').toLowerCase().includes(query);
      const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
      return matchesSearch && matchesAction && matchesEntity;
    }),
    [logs, searchTerm, actionFilter, entityFilter]
  );

  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATE':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'UPDATE':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'DELETE':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      case 'APPROVE':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'CREATE':
        return <Plus size={16} />;
      case 'UPDATE':
        return <Edit size={16} />;
      case 'DELETE':
        return <Trash2 size={16} />;
      default:
        return <Activity size={16} />;
    }
  };

  return (
    <Layout>
      <div className="flex-1 p-6 lg:p-8 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Audit Logs ⚙️
          </h1>
          <p className="text-slate-600 dark:text-slate-400">System activity and change tracking</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all"
            />
          </div>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <Filter size={20} />
            {showFilters ? 'Hide Filters' : 'Filter'}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <select
              className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="APPROVE">APPROVE</option>
            </select>
            <select
              className="w-full rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2"
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
            >
              <option value="ALL">All Entities</option>
              <option value="Goal">Goal</option>
              <option value="User">User</option>
              <option value="Cycle">Cycle</option>
              <option value="CheckIn">CheckIn</option>
            </select>
          </div>
        )}

        {/* Logs Timeline */}
        <Card variant="elevated">
          <div className="space-y-1">
            {!loading && filteredLogs.map((log, index) => (
              <div key={log.id}>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg">
                  <div className="flex items-start gap-4">
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center mt-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(log.action)} flex-shrink-0`}>
                        {getActionIcon(log.action)}
                      </div>
                      {index < filteredLogs.length - 1 && (
                        <div className="w-0.5 h-12 bg-slate-200 dark:bg-slate-700 mt-2"></div>
                      )}
                    </div>

                    {/* Log details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {log.entityType}: {log.newValues?.title || log.newValues?.name || log.entityId}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{log.reason || 'No additional details'}</p>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4 flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(log.createdAt).toISOString().replace('T', ' ').slice(0, 19)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <User size={14} />
                        {log.User ? `${log.User.firstName} ${log.User.lastName}` : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
                {index < filteredLogs.length - 1 && (
                  <div className="border-t border-slate-100 dark:border-slate-700"></div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {filteredLogs.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No logs found</p>
          </div>
        )}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 text-lg">Loading audit logs...</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AuditLogsPage;
