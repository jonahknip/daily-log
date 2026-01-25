import React from 'react';
import LogForm from '@/components/dailylog/LogForm';

export default function LogEntry() {
  return (
    <div className="space-y-6">
      <div className="md:text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">New Daily Entry</h1>
        <p className="text-slate-500 mt-2">Record today's field activities, hours, and site conditions.</p>
      </div>
      <LogForm />
    </div>
  );
}