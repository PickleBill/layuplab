import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Play, X, Clock, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { drills } from "@/lib/drills";
import { Drill, DrillCategory, Equipment } from "@/types/app";

const CATEGORIES: { value: DrillCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'shooting', label: 'Shooting' },
  { value: 'dribbling', label: 'Dribbling' },
  { value: 'footwork', label: 'Footwork' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'agility', label: 'Agility' },
];

const CATEGORY_COLORS: Record<DrillCategory, string> = {
  shooting: 'bg-primary/20 text-primary',
  dribbling: 'bg-accent/20 text-accent',
  footwork: 'bg-blue-500/20 text-blue-400',
  conditioning: 'bg-red-500/20 text-red-400',
  agility: 'bg-green-500/20 text-green-400',
};

const EQUIP_LABELS: Record<Equipment, string> = {
  hoop: '🏀 Hoop',
  cones: '🔶 Cones',
  resistance_band: '💪 Band',
  jump_rope: '🪢 Rope',
  none: '✋ None',
};

const DrillLibrary = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DrillCategory | 'all'>('all');
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return drills.filter(d => {
      if (category !== 'all' && d.category !== category) return false;
      if (difficulty && d.difficulty !== difficulty) return false;
      if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, category, difficulty]);

  const openVideo = (drill: Drill) => {
    setSelectedDrill(drill);
    setVideoOpen(true);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:v=|\/)([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-foreground mb-2">Drill Library</h1>
        <p className="text-muted-foreground font-body">Browse all drills, watch demos, and learn proper technique.</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search drills..."
            className="w-full h-11 pl-10 pr-4 rounded-md border border-border bg-card text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${
                category === c.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {c.label}
            </button>
          ))}
          <div className="w-px bg-border mx-1" />
          {[1, 2, 3].map(d => (
            <button
              key={d}
              onClick={() => setDifficulty(difficulty === d ? null : d)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${
                difficulty === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {Array.from({ length: d }).map((_, i) => (
                <Star key={i} size={10} className="fill-current" />
              ))}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-body mb-4">{filtered.length} drill{filtered.length !== 1 ? 's' : ''}</p>

      {/* Drill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((drill, i) => (
          <motion.div
            key={drill.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="border border-border rounded-lg bg-card overflow-hidden hover:border-muted-foreground/30 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm">{drill.name}</h3>
                  <Badge className={`mt-1 text-[10px] ${CATEGORY_COLORS[drill.category]}`}>
                    {drill.category}
                  </Badge>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: drill.difficulty }).map((_, i) => (
                    <Star key={i} size={12} className="fill-primary text-primary" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground font-body mb-3">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {Math.round(drill.duration / 60)}m
                </span>
                {drill.reps && <span>{drill.reps} reps</span>}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {drill.equipment.map(eq => (
                  <span key={eq} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-body">
                    {EQUIP_LABELS[eq]}
                  </span>
                ))}
              </div>

              {/* Expandable detail */}
              <AnimatePresence>
                {expandedId === drill.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-foreground/80 font-body mb-2">{drill.description}</p>
                    <div className="bg-primary/5 border border-primary/10 rounded p-2 mb-2">
                      <p className="text-xs text-primary font-body">💡 {drill.tip}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === drill.id ? null : drill.id)}
                  className="flex-1 text-xs text-muted-foreground font-body hover:text-foreground transition-colors py-1"
                >
                  {expandedId === drill.id ? 'Less' : 'Details'}
                </button>
                {drill.videoUrl && (
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => openVideo(drill)}>
                    <Play size={12} /> Demo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-display font-bold text-foreground">No drills match your filters</p>
          <p className="text-sm text-muted-foreground font-body mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display">{selectedDrill?.name} — Demo</DialogTitle>
          </DialogHeader>
          {selectedDrill?.videoUrl && (
            <div className="aspect-video w-full rounded-md overflow-hidden bg-black">
              <iframe
                src={getYouTubeEmbedUrl(selectedDrill.videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {selectedDrill && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground font-body">{selectedDrill.description}</p>
              <div className="bg-primary/5 border border-primary/10 rounded p-3 mt-3">
                <p className="text-sm text-primary font-body">💡 {selectedDrill.tip}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrillLibrary;
