import React, { useState, useMemo } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AppConfig } from "@/components/AppConfig";
import { mockData } from "@/components/mockData";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Loader2, 
  Map as MapIcon, 
  ListFilter, 
  Briefcase, 
  Clock, 
  Users, 
  AlertTriangle,
  Plus,
  Sun,
  Cloud,
  CloudRain,
  MapPin,
  Calendar,
  HardHat,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { format } from 'date-fns';

const BRAND_RED = AppConfig.branding.accentColor;
const BRAND_NAVY = AppConfig.branding.primaryColor;
const COLORS = [AppConfig.branding.primaryColor, AppConfig.branding.accentColor, '#475569', '#94a3b8', '#cbd5e1'];

const WeatherIcon = ({ condition }) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("sun") || c.includes("clear")) return <Sun className="w-4 h-4 text-amber-500" />;
  if (c.includes("rain") || c.includes("shower")) return <CloudRain className="w-4 h-4 text-blue-500" />;
  return <Cloud className="w-4 h-4 text-slate-400" />;
};

export default function Dashboard() {
  const [selectedJob, setSelectedJob] = useState("all");

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      if (AppConfig.demoMode.enabled) return mockData.logs;
      return base44.entities.DailyLog.list({ sort: { date: -1 }, limit: 100 });
    },
    initialData: []
  });

  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (AppConfig.demoMode.enabled) return mockData.jobs;
      return base44.entities.Job.list();
    },
    initialData: []
  });

  // 1. Filter Logic
  const filteredLogs = useMemo(() => {
     if (selectedJob === "all") return logs;
     return logs.filter(log => log.job_id === selectedJob || log.job_number === jobs.find(j => j.id === selectedJob)?.job_number);
  }, [logs, selectedJob, jobs]);

  // 2. Calculate KPIs
  const today = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    const todaysLogs = filteredLogs.filter(l => l.date === today);
    const totalHours = filteredLogs.reduce((acc, l) => acc + (l.hours_worked || 0), 0);
    const uniqueCrews = new Set(filteredLogs.map(l => l.crew_name)).size;
    const issuesCount = filteredLogs.filter(l => l.notes?.toLowerCase().includes("issue") || l.notes?.toLowerCase().includes("delay") || l.notes?.toLowerCase().includes("hit")).length;

    return {
      entriesToday: todaysLogs.length,
      totalHours: totalHours,
      activeCrews: uniqueCrews,
      issues: issuesCount
    };
  }, [filteredLogs, today]);

  // 3. Chart Data
  const workTypeData = useMemo(() => {
    const counts = {};
    filteredLogs.forEach(log => {
      const type = log.work_performed || "Other";
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredLogs]);

  const hoursByDateData = useMemo(() => {
    const data = {};
    filteredLogs.slice(0, 14).forEach(log => {
      const d = format(new Date(log.date), 'MMM d');
      data[d] = (data[d] || 0) + (log.hours_worked || 0);
    });
    return Object.keys(data).map(d => ({ name: d, hours: data[d] })).reverse();
  }, [filteredLogs]);

  const activeJobContext = jobs.find(j => j.id === selectedJob);

  if (logsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-color)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: AppConfig.branding.primaryColor }}>{AppConfig.branding.appName} — Dashboard</h1>
          <div className="h-1 w-24 mt-2 mb-2" style={{ backgroundColor: AppConfig.branding.accentColor }}></div>
          <p className="text-slate-500 uppercase tracking-wider text-sm font-medium">{AppConfig.branding.tagline}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
             <ListFilter className="w-4 h-4 text-slate-500" />
             <Select value={selectedJob} onValueChange={setSelectedJob}>
               <SelectTrigger className="border-0 focus:ring-0 w-[220px] h-8 p-0 text-[var(--primary-color)] font-medium">
                 <SelectValue placeholder="Filter by Job #" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">All Active Jobs</SelectItem>
                 {jobs.map(job => (
                   <SelectItem key={job.id} value={job.id}>{job.job_number} — {job.name}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <Link to={createPageUrl('LogEntry')}>
             <Button className="bg-[var(--accent-color)] opacity-90 text-white gap-2">
               <Plus className="w-4 h-4" /> Start New Log
             </Button>
           </Link>
        </div>
      </div>

      {/* JOB CONTEXT SUMMARY (If Selected) */}
      {activeJobContext && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[var(--accent-color)]" />
            <span className="font-semibold text-[var(--primary-color)]">Job #:</span> {activeJobContext.job_number}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-color)]" />
            <span className="font-semibold text-[var(--primary-color)]">Location:</span> {activeJobContext.address}
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent-color)]" />
            <span className="font-semibold text-[var(--primary-color)]">PM:</span> {activeJobContext.pm_name}
          </div>
          {activeJobContext.client && (
             <div className="flex items-center gap-2">
               <HardHat className="w-4 h-4 text-[var(--accent-color)]" />
               <span className="font-semibold text-[var(--primary-color)]">Client:</span> {activeJobContext.client}
             </div>
          )}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[var(--primary-color)] shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Entries Today</p>
                <h3 className="text-2xl font-bold text-[var(--primary-color)] mt-1">{stats.entriesToday}</h3>
              </div>
              <Briefcase className="w-5 h-5 text-[var(--primary-color)] opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[var(--accent-color)] shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Total Hours</p>
                <h3 className="text-2xl font-bold text-[var(--primary-color)] mt-1">{stats.totalHours.toFixed(1)}</h3>
              </div>
              <Clock className="w-5 h-5 text-[var(--accent-color)] opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-slate-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Active Crews</p>
                <h3 className="text-2xl font-bold text-[var(--primary-color)] mt-1">{stats.activeCrews}</h3>
              </div>
              <Users className="w-5 h-5 text-slate-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Issues Flagged</p>
                <h3 className="text-2xl font-bold text-[var(--primary-color)] mt-1">{stats.issues}</h3>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--primary-color)]">Work Type Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={workTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-[var(--primary-color)]">Hours Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByDateData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="hours" fill={AppConfig.branding.primaryColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT GRID: Logs & Photos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SCROLLABLE LOG LIST */}
        <div className="lg:col-span-2">
           <Card className="shadow-sm border-slate-200 h-full">
             <CardHeader className="border-b border-slate-100 bg-slate-50/50">
               <div className="flex justify-between items-center">
                 <CardTitle className="text-lg font-semibold text-[var(--primary-color)]">Field Log Feed</CardTitle>
                 <Badge variant="outline" className="bg-white text-slate-500 border-slate-200">
                   Live Updates
                 </Badge>
               </div>
             </CardHeader>
             <div className="max-h-[500px] overflow-y-auto">
               <table className="w-full text-sm text-left">
                 <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                   <tr>
                     <th className="px-6 py-3 font-medium">Date / Job #</th>
                     <th className="px-6 py-3 font-medium">Work & Crew</th>
                     <th className="px-6 py-3 font-medium text-right">Hours</th>
                     <th className="px-6 py-3 font-medium text-center">Weather</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {filteredLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                       <td className="px-6 py-4">
                         <div className="font-medium text-[var(--primary-color)]">{format(new Date(log.date), 'MMM d, yyyy')}</div>
                         <div className="text-xs text-slate-500 mt-0.5 font-mono bg-slate-100 inline-block px-1 rounded">
                           {log.job_number || "N/A"}
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <div className="font-medium text-slate-700">{log.work_performed}</div>
                         <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                           <HardHat className="w-3 h-3" /> {log.crew_name}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right font-semibold text-[var(--primary-color)]">
                         {log.hours_worked}
                       </td>
                       <td className="px-6 py-4 flex justify-center">
                         <div className="flex flex-col items-center gap-1">
                           <WeatherIcon condition={log.weather} />
                           <span className="text-[10px] text-slate-400">{log.weather || "-"}</span>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
               {filteredLogs.length === 0 && (
                 <div className="p-8 text-center text-slate-500">
                   No logs found for this selection.
                 </div>
               )}
             </div>
           </Card>
        </div>

        {/* PHOTO GRID */}
        <div className="lg:col-span-1">
          <Card className="shadow-sm border-slate-200 h-full">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-[var(--primary-color)]">Site Photos</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {filteredLogs
                  .filter(l => l.photos && l.photos.length > 0)
                  .slice(0, 6)
                  .flatMap(l => l.photos)
                  .map((photoUrl, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative group">
                      <img src={photoUrl} alt="Site" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                ))}
                {/* Placeholders if empty */}
                {filteredLogs.filter(l => l.photos?.length).length === 0 && (
                  [1,2,3,4].map(i => (
                    <div key={i} className="aspect-square rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                 <p className="text-xs text-center text-slate-400">Showing recent uploads from field entries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SYSTEM OVERVIEW / DOCUMENTATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-200 mt-8">
        <div className="prose prose-slate prose-sm max-w-none">
          <h3 className="font-bold flex items-center gap-2" style={{ color: AppConfig.branding.primaryColor }}>
             SYSTEM OVERVIEW
          </h3>
          <p className="text-slate-600">
            This dashboard represents the base version of {AppConfig.branding.appName}, an
            automated field reporting and operations system designed to streamline
            operations documentation.
          </p>
          <ul className="space-y-2 mt-4">
            {[
              "Daily log intake & processing",
              "Automated dashboard analytics",
              "Job-based filtering & context",
              "Real-time weather integration",
              "Crew and work type performance tracking",
              "Visual photo documentation"
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-600">
                <span className="mt-1.5 w-1.5 h-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: AppConfig.branding.accentColor }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
           <div>
             <h3 className="text-[var(--primary-color)] font-bold text-sm uppercase mb-2">Workflow Architecture</h3>
             <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm space-y-3">
               {[
                 { step: "1", title: "Data Capture", desc: "Survey123 Form / Mobile App" },
                 { step: "2", title: "Ingestion", desc: "ArcGIS Feature Layer" },
                 { step: "3", title: "Processing", desc: "Node-RED & AI Engine" },
                 { step: "4", title: "Storage", desc: "Daily Log Database" },
                 { step: "5", title: "Visualization", desc: "Live Dashboard (This Page)" }
               ].map((item, index) => (
                 <div key={index} className="flex items-center gap-3 relative">
                   {index !== 4 && (
                     <div className="absolute left-[11px] top-8 bottom-[-12px] w-[2px] bg-slate-100" />
                   )}
                   <div className="w-6 h-6 rounded-full bg-[#0A1A3F] text-white flex items-center justify-center text-[10px] font-bold z-10 flex-shrink-0">
                     {item.step}
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-[var(--primary-color)] uppercase">{item.title}</span>
                     <span className="text-xs text-slate-500">{item.desc}</span>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           <div>
             <h3 className="text-[var(--primary-color)] font-bold text-sm uppercase mb-2">Project Problem Statement</h3>
             <div className="bg-slate-50 border-l-4 border-[#0A1A3F] p-5 text-sm text-slate-700 rounded-r-lg shadow-sm">
               <p className="leading-relaxed">
                 <strong className="text-[var(--primary-color)]">Challenge:</strong> Field operations need rapid, accurate reporting with minimal manual data entry.
               </p>
               <p className="mt-2 leading-relaxed">
                 <strong className="text-[var(--accent-color)]">Solution:</strong> This system demonstrates the first step toward automated daily logs, project-level insights, and AI-enabled recommendations.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}