import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useAuthStore } from '../context/authStore';
import apiService from '../services/api';
import { AlertCircle, Zap, Target, TrendingUp } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('TOKEN (after login):', localStorage.getItem('token'));
      login(response.data.user, response.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="w-full max-w-md z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-slideInDown">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg backdrop-blur">
              <Zap className="text-white" size={32} />
            </div>
            <h1 className="text-5xl font-bold text-white">GoalQuest</h1>
          </div>
          <p className="text-blue-100 text-lg font-medium">Goal Setting & Tracking Portal</p>
          <p className="text-blue-100 text-sm mt-2 opacity-80">Achieve your goals with our intelligent tracking system</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-3 mb-8 animate-slideInUp">
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-3 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <Target className="text-blue-200 mx-auto mb-2" size={24} />
            <p className="text-xs text-blue-100 font-medium">Smart Goals</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-3 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <TrendingUp className="text-blue-200 mx-auto mb-2" size={24} />
            <p className="text-xs text-blue-100 font-medium">Track Progress</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur rounded-lg p-3 text-center border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
            <Zap className="text-blue-200 mx-auto mb-2" size={24} />
            <p className="text-xs text-blue-100 font-medium">Get Results</p>
          </div>
        </div>

        {/* Login Card */}
        <Card variant="elevated" className="backdrop-blur-xl bg-white bg-opacity-95 animate-slideInUp">
          <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-slate-600 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex gap-3 animate-slideInDown">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="Email Address"
              name="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-6"
              variant="primary"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="text-sm font-bold text-slate-800 mb-4 text-center">📝 Demo Credentials</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600"><strong>Employee:</strong></span>
                <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">employee@company.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600"><strong>Manager:</strong></span>
                <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">manager@company.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600"><strong>Admin:</strong></span>
                <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">admin@company.com</code>
              </div>
              <div className="pt-2 border-t border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600"><strong>Password:</strong></span>
                  <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">password123</code>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-blue-100 text-xs mt-6">
          © 2024 GoalQuest Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
