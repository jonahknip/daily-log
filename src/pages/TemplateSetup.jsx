import React from 'react';
import { AppConfig } from "@/components/AppConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function TemplateSetup() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold" style={{ color: AppConfig.branding.primaryColor }}>Template Setup Guide</h1>
        <p className="text-slate-500 text-lg">Follow these steps to customize and deploy your application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Branding Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Open <code>components/AppConfig.js</code> to change the look and feel.
          </p>
          <div className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs">
{`export const AppConfig = {
  branding: {
    appName: "${AppConfig.branding.appName}", // Change this
    companyName: "${AppConfig.branding.companyName}", // Change this
    primaryColor: "${AppConfig.branding.primaryColor}", // Change hex code
    ...
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Demo Mode & API Keys</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
            <strong>Current Status:</strong> 
            {AppConfig.demoMode.enabled ? "Demo Mode is ON" : "Demo Mode is OFF"}
          </div>
          <p className="text-sm text-slate-600">
            To go live, set <code>demoMode.enabled</code> to <code>false</code> in <code>components/AppConfig.js</code> and add your API keys.
          </p>
          <p className="text-sm font-semibold mt-2">Required Secrets:</p>
          <ul className="list-disc list-inside text-sm text-slate-600 ml-2">
            <li>{AppConfig.ai.openAiKeyEnv} (for AI features)</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Deployment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Your app is ready to deploy on Base44.
          </p>
          <Button className="w-full sm:w-auto" style={{ backgroundColor: AppConfig.branding.primaryColor }}>
            <ExternalLink className="w-4 h-4 mr-2" /> Open Deployment Settings
          </Button>
        </CardContent>
      </Card>

      <div className="text-center pt-8 border-t">
        <p className="text-xs text-slate-400">
          Template Version 1.0.0 • {AppConfig.branding.companyName}
        </p>
      </div>
    </div>
  );
}