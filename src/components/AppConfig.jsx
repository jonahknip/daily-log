export const AppConfig = {
  branding: {
    appName: "FieldOps Template",
    companyName: "Template Co.",
    tagline: "A customizable field operations platform.",
    logoUrl: "https://placehold.co/200x200?text=Ops",
    primaryColor: "#1E3A8A", // Generic Blue
    accentColor: "#F43F5E", // Generic Red/Pink
    backgroundColor: "#F8FAFC",
    fontFamily: "Inter, sans-serif"
  },

  demoMode: {
    enabled: true,
    useFakeAIResponses: true,
    useMockAccounts: true,
    useMockTransactions: true,
    useMockGoals: true
  },

  ai: {
    model: "gpt-4o-mini",
    temperature: 0.4,
    fallbackResponse: "Hi! I'm your AI assistant. Demo mode is active.",
    openAiKeyEnv: "OPENAI_API_KEY"
  },

  features: {
    enableChatbot: false,
    enableDashboard: true,
    enableAnalytics: true,
    enableGoals: false,
    enableTransactions: false
  }
};