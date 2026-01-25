import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { AppConfig } from "@/components/AppConfig";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AIAnalysis({ photos, onAnalysisComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const runAnalysis = async () => {
    if (!photos || photos.length === 0) {
      alert("Please upload photos first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      if (AppConfig.demoMode.enabled) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const mockResponse = {
          equipment_used: "Excavator, Dump Truck",
          work_performed: "Site clearing and grading",
          safety_flags: ["Workers visible near active machinery"],
          materials: ["Soil", "Gravel"]
        };
        setAnalysisResult(mockResponse);
        if (onAnalysisComplete) onAnalysisComplete(mockResponse);
        return;
      }

      const prompt = `
        You are a Field Operations AI Agent for a construction company.
        Analyze these site photos and extract the following structured data:
        1. Equipment visible (list of machines/tools)
        2. Work performed (infer from context, e.g. "Trenching", "Paving")
        3. Safety hazards (e.g. "No PPE", "Unshored trench") or "None detected"
        4. Materials visible (e.g. "PVC Pipe", "Concrete", "Gravel")
        
        Return ONLY a JSON object with this schema:
        {
          "equipment_used": "string (comma separated)",
          "work_performed": "string (short description)",
          "safety_flags": ["string"],
          "materials": ["string"]
        }
      `;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: photos,
        response_json_schema: {
          type: "object",
          properties: {
            equipment_used: { type: "string" },
            work_performed: { type: "string" },
            safety_flags: { type: "array", items: { type: "string" } },
            materials: { type: "array", items: { type: "string" } }
          }
        }
      });

      setAnalysisResult(res);
      if (onAnalysisComplete) {
        onAnalysisComplete(res);
      }

    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("AI Agent could not analyze photos. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {!analysisResult ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={runAnalysis}
          disabled={isAnalyzing || photos.length === 0}
          className="w-full border-slate-200 bg-slate-50 hover:bg-slate-100"
          style={{ color: AppConfig.branding.primaryColor }}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AI Agent Analyzing Site...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-Fill from Photos
            </>
          )}
        </Button>
      ) : (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2" style={{ color: AppConfig.branding.primaryColor }}>
                <Sparkles className="w-4 h-4" /> AI Analysis
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 text-xs"
                onClick={() => setAnalysisResult(null)}
              >
                Reset
              </Button>
            </div>

            {analysisResult.safety_flags?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                 {analysisResult.safety_flags.map((flag, i) => (
                   <Badge key={i} variant="destructive" className="flex items-center gap-1">
                     <AlertTriangle className="w-3 h-3" /> {flag}
                   </Badge>
                 ))}
              </div>
            ) : (
              <div className="flex items-center text-green-700 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" /> No safety hazards detected
              </div>
            )}
            
            <div className="text-sm text-slate-700">
              <p><strong>Detected:</strong> {analysisResult.work_performed}</p>
              <p className="mt-1"><strong>Equipment:</strong> {analysisResult.equipment_used}</p>
              {analysisResult.materials?.length > 0 && (
                <p className="mt-1"><strong>Materials:</strong> {analysisResult.materials.join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}