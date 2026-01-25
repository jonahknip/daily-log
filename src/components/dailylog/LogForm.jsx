import React, { useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AppConfig } from "@/components/AppConfig";
import { mockData } from "@/components/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Send, CloudSun, Info } from "lucide-react";
import ImageUpload from "./ImageUpload";
import AIAnalysis from "./AIAnalysis";

export default function LogForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  
  // Load Jobs for selection
  const { data: jobs } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      if (AppConfig.demoMode.enabled) return mockData.jobs;
      return base44.entities.Job.list({ sort: { name: 1 } });
    },
    initialData: []
  });

  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    job_id: "",
    crew_name: "",
    location: "",
    work_performed: "",
    equipment_used: "",
    hours_worked: "",
    weather: "",
    weather_snapshot: null,
    notes: "",
    photos: [],
    ai_analysis: null
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Auto-fill job details
  const handleJobSelect = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      setFormData(prev => ({
        ...prev,
        job_id: job.id,
        location: job.address || prev.location,
        crew_name: job.default_crew || prev.crew_name,
        job_number: job.job_number
      }));
    }
  };

  // Smart Weather Fetch
  const fetchWeather = async () => {
    setIsFetchingWeather(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`);
          const data = await res.json();
          
          if (data.current) {
            const temp = data.current.temperature_2m;
            const wind = data.current.wind_speed_10m;
            const weatherStr = `Temp: ${temp}°C, Wind: ${wind}km/h`;
            
            setFormData(prev => ({
              ...prev,
              weather: weatherStr,
              weather_snapshot: {
                temp_c: temp,
                wind_speed: wind,
                condition: "Recorded at " + new Date().toLocaleTimeString()
              }
            }));
          }
        } catch (e) {
          console.error("Weather fetch failed", e);
          alert("Could not fetch weather.");
        } finally {
          setIsFetchingWeather(false);
        }
      });
    } else {
      alert("Geolocation not supported.");
      setIsFetchingWeather(false);
    }
  };

  const handleAIComplete = (result) => {
    setFormData(prev => ({
      ...prev,
      equipment_used: result.equipment_used || prev.equipment_used,
      work_performed: prev.work_performed ? prev.work_performed : result.work_performed, // Don't overwrite if user typed something
      ai_analysis: {
        safety_flags: result.safety_flags,
        detected_objects: result.materials,
        summary: result.work_performed
      },
      notes: prev.notes + (result.safety_flags?.length ? `\n[AI Safety Flag]: ${result.safety_flags.join(", ")}` : "")
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Demo Mode Bypass
      if (AppConfig.demoMode.enabled) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        console.log("DEMO MODE: Mock submission", formData);
      } else {
        // 1. Save to Database
        await base44.entities.DailyLog.create({
          ...formData,
          hours_worked: parseFloat(formData.hours_worked) || 0
        });
      }

      // 2. Automation: Send Email Notification
      const currentUser = await base44.auth.me().catch(() => ({ email: 'user@example.com' }));
      
      await base44.integrations.Core.SendEmail({
        to: currentUser.email,
        subject: `New Field Log: ${formData.crew_name} - ${formData.date}`,
        body: `
          <h1>New Daily Log Submitted</h1>
          <p><strong>Crew:</strong> ${formData.crew_name}</p>
          <p><strong>Location:</strong> ${formData.location}</p>
          <p><strong>Work Performed:</strong> ${formData.work_performed}</p>
          <p><strong>Hours:</strong> ${formData.hours_worked}</p>
          <p><strong>Weather:</strong> ${formData.weather}</p>
          <br/>
          <p>View full details in the dashboard.</p>
        `
      });

      setIsSuccess(true);
      setFormData(initialFormState);
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);

    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit log. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Log Submitted!</h2>
          <p className="text-green-600">Your daily report has been saved and the manager notified.</p>
          <Button 
            variant="outline" 
            className="mt-6 bg-white hover:bg-green-100 border-green-200 text-green-700"
            onClick={() => setIsSuccess(false)}
          >
            Submit Another Log
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-0 ring-1 ring-slate-200">
      <CardHeader className="bg-white border-b border-slate-100 pb-6">
        <CardTitle className="text-xl font-semibold text-slate-800">Daily Field Log</CardTitle>
        <CardDescription>Fill out all details for the day's operations.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Job Selection Section */}
          <div className="space-y-2">
            <Label>Select Job (Auto-Fill)</Label>
            <Select onValueChange={handleJobSelect}>
              <SelectTrigger className="bg-slate-50 border-slate-200">
                <SelectValue placeholder="Search Job Number..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>
                    <span className="font-medium">{job.job_number}</span> - {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.job_number && (
              <div className="text-xs flex items-center mt-1" style={{ color: AppConfig.branding.primaryColor }}>
                <Info className="w-3 h-3 mr-1" /> 
                Auto-filled context for Job #{formData.job_number}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weather" className="flex justify-between items-center">
                <span>Weather</span>
                <button 
                  type="button" 
                  onClick={fetchWeather} 
                  className="text-xs hover:underline flex items-center"
                  style={{ color: AppConfig.branding.accentColor }}
                  disabled={isFetchingWeather}
                >
                  {isFetchingWeather ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <CloudSun className="w-3 h-3 mr-1" />}
                  Fetch Live
                </button>
              </Label>
              <div className="flex gap-2">
                 <Input
                   value={formData.weather || ""}
                   onChange={(e) => handleChange("weather", e.target.value)}
                   placeholder="Click 'Fetch Live' or type..."
                 />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="crew">Crew / Foreman</Label>
              <Input 
                id="crew" 
                value={formData.crew_name}
                onChange={(e) => handleChange("crew_name", e.target.value)}
                placeholder="Auto-fills from Job"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Auto-fills from Job"
              />
            </div>
          </div>

          <div className="space-y-2">
             <Label>Site Photos & AI Analysis</Label>
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <ImageUpload 
                  images={formData.photos} 
                  onChange={(urls) => handleChange("photos", urls)}
                />
                
                {formData.photos.length > 0 && (
                   <AIAnalysis 
                     photos={formData.photos} 
                     onAnalysisComplete={handleAIComplete}
                   />
                )}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="work">Work Performed</Label>
              <Textarea 
                id="work" 
                placeholder="Describe the tasks completed today..."
                className="min-h-[100px]"
                required
                value={formData.work_performed}
                onChange={(e) => handleChange("work_performed", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Total Hours</Label>
              <Input 
                id="hours" 
                type="number" 
                min="0" 
                step="0.5"
                placeholder="0.0"
                required
                value={formData.hours_worked}
                onChange={(e) => handleChange("hours_worked", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment Used</Label>
            <Input 
              id="equipment" 
              placeholder="e.g. Excavator, Scissor Lift, Hand Tools"
              value={formData.equipment_used}
              onChange={(e) => handleChange("equipment_used", e.target.value)}
            />
          </div>

          {/* Removed duplicate Site Photos section - moved up */}

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any issues, delays, or extra comments..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full text-lg py-6"
            style={{ backgroundColor: AppConfig.branding.primaryColor }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Daily Log <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}