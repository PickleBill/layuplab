import { Video } from "lucide-react";

const Analyze = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto text-center py-20">
      <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
        <Video size={32} className="text-primary" />
      </div>
      <h1 className="font-display font-extrabold text-2xl text-foreground mb-2">AI Video Analysis</h1>
      <p className="text-muted-foreground font-body mb-4">
        Upload a video of your shooting form, dribbling, or footwork and get instant AI-powered feedback.
      </p>
      <p className="text-sm text-muted-foreground font-body">
        Coming soon — this feature requires Lovable Cloud to be enabled for AI processing.
      </p>
    </div>
  );
};

export default Analyze;
