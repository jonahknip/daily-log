import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin, ClipboardList, TrendingUp } from "lucide-react";

export default function StatsOverview({ logs }) {
  // Calculate stats
  const totalLogs = logs.length;
  const totalHours = logs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);
  const uniqueSites = new Set(logs.map(log => log.location)).size;
  const activeCrews = new Set(logs.map(log => log.crew_name)).size;

  const stats = [
    {
      title: "Total Logs",
      value: totalLogs,
      icon: ClipboardList,
      desc: "All time entries",
      color: "bg-blue-500"
    },
    {
      title: "Total Hours",
      value: totalHours.toFixed(1),
      icon: Clock,
      desc: "Man-hours logged",
      color: "bg-indigo-500"
    },
    {
      title: "Active Sites",
      value: uniqueSites,
      icon: MapPin,
      desc: "Unique locations",
      color: "bg-emerald-500"
    },
    {
      title: "Active Crews",
      value: activeCrews,
      icon: TrendingUp,
      desc: "Reporting teams",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-x-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 text-white ${stat.color} rounded-lg p-1`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}