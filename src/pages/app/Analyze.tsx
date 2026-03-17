import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Camera, Loader2, Target, AlertTriangle, CheckCircle, ArrowLeft, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AnalysisType = 'shooting' | 'dribbling' | 'footwork';

interface Correction {
  area: string;
  issue: string;
  fix: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnalysisResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  corrections: Correction[];
  drillRecommendations: string[];
  detailedNotes: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'border-destructive/30 bg-destructive/5 text-destructive',
  medium: 'border-primary/30 bg-primary/5 text-primary',
  low: 'border-muted-foreground/30 bg-muted/20 text-muted-foreground',
};

const Analyze = () => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('shooting');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      extractFrameFromVideo(file);
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Please upload an image or video file");
    }
  };

  const extractFrameFromVideo = (file: File) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.currentTime = 1;
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(dataUrl);
      setResult(null);
      URL.revokeObjectURL(url);
    };
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRecording(true);
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImagePreview(dataUrl);
    setResult(null);
    stopCamera();
  };

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsRecording(false);
  }, []);

  const analyzeImage = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);

    try {
      const base64 = imagePreview.split(',')[1];
      const { data, error } = await supabase.functions.invoke('analyze-form', {
        body: { imageBase64: base64, analysisType },
      });

      if (error) {
        throw new Error(error.message || 'Analysis failed');
      }
      if (data?.error) {
        throw new Error(data.error);
      }

      setResult(data as AnalysisResult);
      toast.success("Analysis complete!");
    } catch (err: any) {
      console.error('Analysis error:', err);
      toast.error(err.message || "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent';
    if (score >= 60) return 'text-primary';
    return 'text-destructive';
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-foreground">AI Form Analysis</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Upload a photo or video clip and get instant AI coaching feedback.
        </p>
      </div>

      {/* Analysis Type Selector */}
      <div className="flex gap-2">
        {(['shooting', 'dribbling', 'footwork'] as AnalysisType[]).map(type => (
          <button
            key={type}
            onClick={() => setAnalysisType(type)}
            className={`px-4 py-2 rounded-md border font-display font-bold text-sm uppercase transition-all ${
              analysisType === type
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/30'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Camera View */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-border overflow-hidden relative"
          >
            <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-video object-cover bg-card" />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
              <Button variant="hero" onClick={captureFrame}>
                <Camera size={16} /> Capture Frame
              </Button>
              <Button variant="outline" onClick={stopCamera}>
                <X size={16} /> Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Area */}
      {!isRecording && !imagePreview && (
        <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
          <Video size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="font-body text-muted-foreground mb-6">
            Upload a photo/video of your {analysisType} form, or use your camera
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Upload File
            </Button>
            <Button variant="outline" onClick={startCamera}>
              <Camera size={16} /> Use Camera
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && !result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="rounded-lg border border-border overflow-hidden relative">
            <img src={imagePreview} alt="Upload preview" className="w-full aspect-video object-cover" />
            <button
              onClick={() => { setImagePreview(null); setResult(null); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center border border-border"
            >
              <X size={14} />
            </button>
          </div>
          <Button variant="hero" className="w-full" onClick={analyzeImage} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing with AI...</>
            ) : (
              <><Target size={16} /> Analyze My {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}</>
            )}
          </Button>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Score Header */}
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">Overall Score</p>
              <p className={`font-display font-extrabold text-6xl ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}
              </p>
              <p className="text-muted-foreground font-body mt-2">{result.summary}</p>
            </div>

            {/* Strengths */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-accent" /> Strengths
              </h3>
              <div className="space-y-2">
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">✓</span>
                    <p className="text-sm font-body text-foreground">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Corrections */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-primary" /> Corrections
              </h3>
              <div className="space-y-3">
                {result.corrections.map((c, i) => (
                  <div key={i} className={`rounded-md border p-3 ${PRIORITY_COLORS[c.priority]}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-display">{c.priority}</Badge>
                      <span className="font-display font-bold text-sm">{c.area}</span>
                    </div>
                    <p className="text-sm font-body"><strong>Issue:</strong> {c.issue}</p>
                    <p className="text-sm font-body"><strong>Fix:</strong> {c.fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Drill Recommendations */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-display font-bold text-foreground mb-3">Recommended Drills</h3>
              <div className="flex flex-wrap gap-2">
                {result.drillRecommendations.map((d, i) => (
                  <Badge key={i} variant="secondary" className="font-body">{d}</Badge>
                ))}
              </div>
            </div>

            {/* Detailed Notes */}
            {result.detailedNotes && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-display font-bold text-foreground mb-3">Detailed Analysis</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed">{result.detailedNotes}</p>
              </div>
            )}

            {/* Try Again */}
            <Button variant="outline" className="w-full" onClick={() => { setImagePreview(null); setResult(null); }}>
              <ArrowLeft size={16} /> Analyze Another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analyze;
