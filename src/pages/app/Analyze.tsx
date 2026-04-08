import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Upload, Camera, Loader2, Target, AlertTriangle, CheckCircle, ArrowLeft, X, Library, Calendar, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getAnalysisHistory, saveAnalysisRecord } from "@/lib/storage";
import { AnalysisRecord } from "@/types/app";

type AnalysisType = 'shooting' | 'dribbling' | 'footwork' | 'defense';

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

/**
 * Extract multiple frames from a video at evenly spaced intervals.
 * Returns an array of base64 JPEG data URLs.
 */
function extractFramesFromVideo(file: File, numFrames = 3): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.preload = 'auto';

    video.onloadedmetadata = () => {
      const duration = video.duration;
      if (!duration || duration < 0.5) {
        URL.revokeObjectURL(url);
        reject(new Error('Video too short'));
        return;
      }

      const times: number[] = [];
      for (let i = 0; i < numFrames; i++) {
        times.push((duration * (i + 1)) / (numFrames + 1));
      }

      const frames: string[] = [];
      let idx = 0;

      const seekAndCapture = () => {
        if (idx >= times.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        video.currentTime = times[idx];
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth, 1280);
        canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push(canvas.toDataURL('image/jpeg', 0.7));
        idx++;
        seekAndCapture();
      };

      seekAndCapture();
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video'));
    };
  });
}

const Analyze = () => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('shooting');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const analysisHistory = getAnalysisHistory();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error("Please upload a video file (.mp4, .mov, .webm, etc.)");
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setResult(null);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], 'recording.webm', { type: 'video/webm' });
        setVideoFile(file);
        setVideoPreviewUrl(URL.createObjectURL(blob));
        setRecordedChunks([]);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecordedChunks([]);
      setIsRecording(true);
    } catch {
      toast.error("Unable to access camera. Please check permissions.");
    }
  };

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setIsRecording(false);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  }, []);

  const clearVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl(null);
    setResult(null);
  };

  const analyzeVideo = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);

    try {
      toast.info("Extracting frames from your video...");
      const frames = await extractFramesFromVideo(videoFile, 3);

      if (frames.length === 0) {
        throw new Error('Could not extract frames from video');
      }

      // Send frames as separate images for analysis
      const imageContents = frames.map((frame) => ({
        type: "image_url" as const,
        image_url: { url: frame },
      }));

      const base64Frames = frames.map(f => f.split(',')[1]);

      const { data, error } = await supabase.functions.invoke('analyze-form', {
        body: { frames: base64Frames, analysisType },
      });

      if (error) throw new Error(error.message || 'Analysis failed');
      if (data?.error) throw new Error(data.error);

      const analysisResult = data as AnalysisResult;
      setResult(analysisResult);

      // Save to history — use first frame as thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      const img = new Image();
      img.src = frames[0];
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const scale = 200 / Math.max(img.width, img.height);
          thumbnailCanvas.width = img.width * scale;
          thumbnailCanvas.height = img.height * scale;
          const ctx = thumbnailCanvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          resolve();
        };
        if (img.complete) {
          const scale = 200 / Math.max(img.width, img.height);
          thumbnailCanvas.width = img.width * scale;
          thumbnailCanvas.height = img.height * scale;
          const ctx = thumbnailCanvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
          resolve();
        }
      });

      const record: AnalysisRecord = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        analysisType,
        thumbnailDataUrl: thumbnailCanvas.toDataURL('image/jpeg', 0.6),
        overallScore: analysisResult.overallScore,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths,
        corrections: analysisResult.corrections,
        drillRecommendations: analysisResult.drillRecommendations,
        detailedNotes: analysisResult.detailedNotes,
      };
      saveAnalysisRecord(record);
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

  const renderResults = (data: AnalysisResult) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-2">Overall Score</p>
        <p className={`font-display font-extrabold text-6xl ${getScoreColor(data.overallScore)}`}>
          {data.overallScore}
        </p>
        <p className="text-muted-foreground font-body mt-2">{data.summary}</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-accent" /> Strengths
        </h3>
        <div className="space-y-2">
          {data.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-accent mt-0.5">✓</span>
              <p className="text-sm font-body text-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle size={18} className="text-primary" /> Corrections
        </h3>
        <div className="space-y-3">
          {data.corrections.map((c, i) => (
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

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="font-display font-bold text-foreground mb-3">Recommended Drills</h3>
        <div className="flex flex-wrap gap-2">
          {data.drillRecommendations.map((d, i) => (
            <Badge key={i} variant="secondary" className="font-body">{d}</Badge>
          ))}
        </div>
      </div>

      {data.detailedNotes && (
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="font-display font-bold text-foreground mb-3">Detailed Analysis</h3>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{data.detailedNotes}</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-2xl text-foreground">AI Form Analysis</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Film yourself training and let AI break down your mechanics. Upload a video or record one now.
        </p>
      </div>

      <Tabs defaultValue="analyze" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="analyze" className="flex-1 gap-1">
            <Target size={14} /> Analyze
          </TabsTrigger>
          <TabsTrigger value="library" className="flex-1 gap-1">
            <Library size={14} /> My Videos ({analysisHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze" className="space-y-6 mt-4">
          {selectedRecord && (
            <div className="space-y-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedRecord(null)}>
                <ArrowLeft size={14} /> Back to analysis
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary" className="uppercase font-display text-xs">{selectedRecord.analysisType}</Badge>
                <span className="text-xs text-muted-foreground font-body">
                  {new Date(selectedRecord.date).toLocaleDateString()}
                </span>
              </div>
              {renderResults(selectedRecord)}
            </div>
          )}

          {!selectedRecord && (
            <>
              {/* Analysis Type Selector */}
              <div className="flex gap-2 flex-wrap">
                {(['shooting', 'dribbling', 'footwork', 'defense'] as AnalysisType[]).map(type => (
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

              {/* Camera Recording View */}
              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-lg border border-destructive/40 overflow-hidden relative"
                  >
                    <video ref={liveVideoRef} autoPlay playsInline muted className="w-full aspect-video object-cover bg-card" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                      <span className="text-xs font-display font-bold text-destructive">RECORDING</span>
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <Button variant="hero" onClick={stopRecording}>
                        <Video size={16} /> Stop & Use Video
                      </Button>
                      <Button variant="outline" onClick={cancelRecording}>
                        <X size={16} /> Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Area */}
              {!isRecording && !videoPreviewUrl && (
                <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-12 text-center">
                  <Video size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="font-body text-muted-foreground mb-2">
                    Upload a video of your {analysisType} form
                  </p>
                  <p className="font-body text-xs text-muted-foreground/70 mb-6">
                    Supports .mp4, .mov, .webm — AI will analyze multiple frames from your clip
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button variant="hero" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={16} /> Upload Video
                    </Button>
                    <Button variant="outline" onClick={startCamera}>
                      <Camera size={16} /> Record Now
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {/* Video Preview */}
              {videoPreviewUrl && !result && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div className="rounded-lg border border-border overflow-hidden relative">
                    <video
                      src={videoPreviewUrl}
                      controls
                      playsInline
                      className="w-full aspect-video object-contain bg-black"
                    />
                    <button
                      onClick={clearVideo}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center border border-border"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <Button variant="hero" className="w-full" onClick={analyzeVideo} disabled={isAnalyzing}>
                    {isAnalyzing ? (
                      <><Loader2 size={16} className="animate-spin" /> Analyzing your video...</>
                    ) : (
                      <><Target size={16} /> Analyze My {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}</>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Results */}
              <AnimatePresence>
                {result && (
                  <>
                    {renderResults(result)}
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center space-y-2">
                      <p className="text-sm font-body text-foreground">
                        🏆 You're already ahead of 90% of players by analyzing your form. Keep pushing!
                      </p>
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => document.querySelector<HTMLButtonElement>('[data-coach-btn]')?.click()}>
                        <MessageCircle size={14} /> Chat with your coach about these results
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full" onClick={clearVideo}>
                      <ArrowLeft size={16} /> Analyze Another Video
                    </Button>
                  </>
                )}
              </AnimatePresence>
            </>
          )}
        </TabsContent>

        <TabsContent value="library" className="mt-4">
          {analysisHistory.length === 0 ? (
            <div className="text-center py-16">
              <Library size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="font-display font-bold text-foreground mb-1">No videos yet</p>
              <p className="text-sm text-muted-foreground font-body">
                Your analyzed videos will appear here after you run an analysis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {analysisHistory.map((record) => (
                <button
                  key={record.id}
                  onClick={() => setSelectedRecord(record)}
                  className="group rounded-lg border border-border bg-card overflow-hidden text-left hover:border-primary/30 transition-all"
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={record.thumbnailDataUrl}
                      alt={`${record.analysisType} analysis`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`font-display font-extrabold text-sm px-2 py-0.5 rounded bg-background/80 ${getScoreColor(record.overallScore)}`}>
                        {record.overallScore}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <Badge variant="secondary" className="text-[10px] uppercase font-display mb-1">
                      {record.analysisType}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground font-body">
                      <Calendar size={10} />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analyze;
