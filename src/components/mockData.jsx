export const mockData = {
  accounts: [
    { name: "Checking", balance: 32000, type: "bank" },
    { name: "Savings", balance: 21000, type: "savings" }
  ],
  transactions: [
    { date: "2025-01-01", amount: -42.50, category: "Dining", name: "Restaurant" },
    { date: "2025-01-02", amount: 2500, category: "Income", name: "Paycheck" }
  ],
  goals: [
    { name: "Emergency Fund", target: 10000, current: 7500 }
  ],
  // Construction Specific Mock Data for existing pages
  jobs: [
    { id: "job1", job_number: "24-1001", name: "Downtown Plaza", address: "123 Main St", pm_name: "Jane Doe", client: "City Council", default_crew: "Crew A" },
    { id: "job2", job_number: "24-1002", name: "Highway Extension", address: "I-95 Mile 40", pm_name: "John Smith", client: "DOT", default_crew: "Crew B" }
  ],
  logs: [
    { 
      id: "log1", 
      date: new Date().toISOString().split('T')[0], 
      job_id: "job1", 
      job_number: "24-1001", 
      crew_name: "Crew A", 
      location: "123 Main St", 
      work_performed: "Excavation for foundation", 
      hours_worked: 8.5, 
      weather: "Sunny, 75F", 
      photos: ["https://placehold.co/600x400?text=Site+Photo+1"],
      notes: "No issues."
    },
    { 
      id: "log2", 
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
      job_id: "job2", 
      job_number: "24-1002", 
      crew_name: "Crew B", 
      location: "I-95 Mile 40", 
      work_performed: "Paving north lane", 
      hours_worked: 9.0, 
      weather: "Cloudy, 65F", 
      photos: ["https://placehold.co/600x400?text=Site+Photo+2"],
      notes: "Material delivery delayed."
    }
  ]
};