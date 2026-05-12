import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Move = "Rock" | "Paper" | "Scissors" | null;
type Result = "Win" | "Lose" | "Draw" | null;
type Difficulty = "Easy" | "Medium" | "Hard";
type Mode = "Classic" | "BestOf3";

interface RoundLog {
  round: number;
  playerMove: Move;
  cpuMove: Move;
  result: Result;
}

interface Stats {
  wins: number;
  losses: number;
  draws: number;
  sessions: number;
  totalRounds: number;
}

const MOVES: Move[] = ["Rock", "Paper", "Scissors"];
const MOVE_ICONS: Record<string, string> = {
  Rock: "🪨",
  Paper: "📄",
  Scissors: "✂️",
};

export default function Game() {
  const [stats, setStats] = useState<Stats>(() => {
    const saved = localStorage.getItem("rps_stats");
    return saved ? JSON.parse(saved) : { wins: 0, losses: 0, draws: 0, sessions: 0, totalRounds: 0 };
  });

  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [mode, setMode] = useState<Mode>("Classic");
  const [playerMove, setPlayerMove] = useState<Move>(null);
  const [cpuMove, setCpuMove] = useState<Move>(null);
  const [result, setResult] = useState<Result>(null);
  const [sessionScore, setSessionScore] = useState({ you: 0, cpu: 0, round: 0 });
  const [seriesScore, setSeriesScore] = useState({ you: 0, cpu: 0 });
  const [history, setHistory] = useState<RoundLog[]>([]);
  const [seriesWinner, setSeriesWinner] = useState<"You" | "CPU" | null>(null);
  const [replayMode, setReplayMode] = useState(false);
  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem("rps_stats", JSON.stringify(stats));
  }, [stats]);

  const determineWin = (player: Move, cpu: Move): Result => {
    if (player === cpu) return "Draw";
    if (
      (player === "Rock" && cpu === "Scissors") ||
      (player === "Scissors" && cpu === "Paper") ||
      (player === "Paper" && cpu === "Rock")
    ) return "Win";
    return "Lose";
  };

  const getCounterMove = (move: Move): Move => {
    if (move === "Rock") return "Paper";
    if (move === "Paper") return "Scissors";
    return "Rock";
  };

  const playRound = (selectedMove: Move) => {
    if (seriesWinner) return;

    let cpuSelected: Move = MOVES[Math.floor(Math.random() * MOVES.length)];
    const r = Math.random();
    if (difficulty === "Medium" && r < 0.3) cpuSelected = getCounterMove(selectedMove);
    else if (difficulty === "Hard" && r < 0.55) cpuSelected = getCounterMove(selectedMove);

    const roundResult = determineWin(selectedMove, cpuSelected);
    setPlayerMove(selectedMove);
    setCpuMove(cpuSelected);
    setResult(roundResult);

    const newRound = sessionScore.round + 1;
    let newYou = sessionScore.you;
    let newCpu = sessionScore.cpu;
    let newStats = { ...stats, totalRounds: stats.totalRounds + 1 };

    if (roundResult === "Win") { newYou++; newStats.wins++; }
    else if (roundResult === "Lose") { newCpu++; newStats.losses++; }
    else { newStats.draws++; }

    setSessionScore({ you: newYou, cpu: newCpu, round: newRound });
    setStats(newStats);
    setHistory((prev) => [
      { round: newRound, playerMove: selectedMove, cpuMove: cpuSelected, result: roundResult },
      ...prev,
    ]);

    if (mode === "BestOf3") {
      let newSeriesYou = seriesScore.you;
      let newSeriesCpu = seriesScore.cpu;
      if (roundResult === "Win") newSeriesYou++;
      else if (roundResult === "Lose") newSeriesCpu++;
      setSeriesScore({ you: newSeriesYou, cpu: newSeriesCpu });

      if (newSeriesYou >= 2) { setSeriesWinner("You"); setTimeout(() => resetSeries(), 3000); }
      else if (newSeriesCpu >= 2) { setSeriesWinner("CPU"); setTimeout(() => resetSeries(), 3000); }
    }
  };

  const resetSeries = () => {
    setSeriesScore({ you: 0, cpu: 0 });
    setSeriesWinner(null);
    setPlayerMove(null);
    setCpuMove(null);
    setResult(null);
  };

  const resetSession = () => {
    setSessionScore({ you: 0, cpu: 0, round: 0 });
    setSeriesScore({ you: 0, cpu: 0 });
    setHistory([]);
    setPlayerMove(null);
    setCpuMove(null);
    setResult(null);
    setSeriesWinner(null);
    setReplayMode(false);
    setStats((prev) => ({ ...prev, sessions: prev.sessions + 1 }));
  };

  const resetAllStats = () => {
    if (confirm("Are you sure you want to reset all-time stats?")) {
      setStats({ wins: 0, losses: 0, draws: 0, sessions: 0, totalRounds: 0 });
    }
  };

  const toggleReplay = () => {
    if (!replayMode && history.length > 0) { setReplayMode(true); setReplayIndex(0); }
    else { setReplayMode(false); }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans dark">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT: Settings & Controls */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <Card className="p-4 bg-card border-border">
            <h2 className="text-lg font-bold text-primary mb-4 uppercase tracking-wider">Settings</h2>
            <div className="mb-6">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2 block">Mode</Label>
              <RadioGroup value={mode} onValueChange={(v: Mode) => setMode(v)} className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Classic" id="mode-classic" />
                  <Label htmlFor="mode-classic" className="cursor-pointer">Classic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="BestOf3" id="mode-bo3" />
                  <Label htmlFor="mode-bo3" className="cursor-pointer">Best of 3</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-2 block">Difficulty</Label>
              <RadioGroup value={difficulty} onValueChange={(v: Difficulty) => setDifficulty(v)} className="flex flex-col gap-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Easy" id="diff-easy" />
                  <Label htmlFor="diff-easy" className="cursor-pointer">Easy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Medium" id="diff-med" />
                  <Label htmlFor="diff-med" className="cursor-pointer">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Hard" id="diff-hard" />
                  <Label htmlFor="diff-hard" className="cursor-pointer text-destructive">Hard</Label>
                </div>
              </RadioGroup>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border flex flex-col gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span>View All-Time Stats</span>
                  <span className="text-primary text-xs">VIEW</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card border-primary/20">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-primary uppercase tracking-wider">All-Time Stats</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-xs text-muted-foreground uppercase">Total Rounds</div>
                    <div className="text-2xl font-bold">{stats.totalRounds}</div>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border">
                    <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalRounds > 0 ? Math.round((stats.wins / stats.totalRounds) * 100) : 0}%
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border col-span-2 flex justify-between">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">Wins</div>
                      <div className="text-xl font-bold text-green-500">{stats.wins}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">Losses</div>
                      <div className="text-xl font-bold text-destructive">{stats.losses}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground uppercase">Draws</div>
                      <div className="text-xl font-bold text-yellow-500">{stats.draws}</div>
                    </div>
                  </div>
                  <div className="bg-background p-4 rounded-md border border-border col-span-2 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase">Sessions</div>
                      <div className="text-xl font-bold">{stats.sessions}</div>
                    </div>
                    <Button variant="destructive" size="sm" onClick={resetAllStats}>Reset Stats</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="secondary" onClick={resetSession}>Restart Session</Button>
          </Card>
        </div>

        {/* MIDDLE: Game Area */}
        <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-2">
          <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border">
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">You</div>
              <div className="text-3xl font-black text-primary">{sessionScore.you}</div>
            </div>
            <div className="text-center flex flex-col items-center">
              <div className="text-xs text-muted-foreground uppercase tracking-widest">Round</div>
              <div className="text-xl font-bold px-4 py-1 bg-background rounded-full border border-border">{sessionScore.round}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">CPU</div>
              <div className="text-3xl font-black text-destructive">{sessionScore.cpu}</div>
            </div>
          </div>

          {mode === "BestOf3" && (
            <div className="text-center py-2 px-4 bg-card border border-primary/30 rounded-lg">
              <span className="text-xs uppercase font-bold tracking-widest text-primary mr-2">Series</span>
              <span className="font-mono text-lg">You {seriesScore.you} — {seriesScore.cpu} CPU</span>
            </div>
          )}

          <Card className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-6 bg-card border-border relative overflow-hidden">
            {seriesWinner && !replayMode ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-background/90 z-20 backdrop-blur-sm"
              >
                <h2 className="text-4xl font-black uppercase tracking-widest">
                  {seriesWinner === "You"
                    ? <span className="text-green-500">You Win Series!</span>
                    : <span className="text-destructive">CPU Wins Series!</span>}
                </h2>
              </motion.div>
            ) : null}

            {replayMode && history.length > 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-between">
                <div className="text-primary font-bold tracking-widest uppercase mb-4">
                  Replay R{history[replayIndex].round}
                </div>
                <div className="flex w-full justify-between items-center px-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2">{MOVE_ICONS[history[replayIndex].playerMove!]}</div>
                    <div className="text-sm font-bold uppercase">You</div>
                  </div>
                  <div className="text-2xl font-black text-muted-foreground">VS</div>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{MOVE_ICONS[history[replayIndex].cpuMove!]}</div>
                    <div className="text-sm font-bold uppercase text-destructive">CPU</div>
                  </div>
                </div>
                <div className={`mt-8 text-2xl font-black uppercase tracking-widest ${
                  history[replayIndex].result === "Win" ? "text-green-500" :
                  history[replayIndex].result === "Lose" ? "text-destructive" : "text-yellow-500"
                }`}>
                  {history[replayIndex].result === "Win" ? "Winner!" :
                   history[replayIndex].result === "Lose" ? "Defeated" : "Draw"}
                </div>
                <div className="flex gap-4 mt-auto pt-8">
                  <Button variant="outline" onClick={() => setReplayIndex(i => Math.min(history.length - 1, i + 1))} disabled={replayIndex >= history.length - 1}>Prev</Button>
                  <Button variant="secondary" onClick={() => setReplayMode(false)}>Exit Replay</Button>
                  <Button variant="outline" onClick={() => setReplayIndex(i => Math.max(0, i - 1))} disabled={replayIndex <= 0}>Next</Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="flex w-full justify-between items-center px-4 mb-12 min-h-[120px]">
                  <AnimatePresence mode="popLayout">
                    {playerMove && (
                      <motion.div key={`p-${sessionScore.round}`} initial={{ x: -50, opacity: 0, scale: 0.5 }} animate={{ x: 0, opacity: 1, scale: 1 }} className="text-center">
                        <div className="text-7xl lg:text-8xl drop-shadow-xl">{MOVE_ICONS[playerMove]}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {playerMove && cpuMove && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-3xl font-black text-muted-foreground italic">VS</motion.div>
                  )}
                  <AnimatePresence mode="popLayout">
                    {cpuMove && (
                      <motion.div key={`c-${sessionScore.round}`} initial={{ x: 50, opacity: 0, scale: 0.5 }} animate={{ x: 0, opacity: 1, scale: 1 }} className="text-center">
                        <div className="text-7xl lg:text-8xl drop-shadow-xl">{MOVE_ICONS[cpuMove]}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="h-12 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {result && (
                      <motion.div
                        key={`r-${sessionScore.round}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`text-3xl font-black uppercase tracking-widest ${
                          result === "Win" ? "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" :
                          result === "Lose" ? "text-destructive drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                          "text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                        }`}
                      >
                        {result === "Win" ? "You Win!" : result === "Lose" ? "You Lose!" : "Draw!"}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-3 gap-4">
            {MOVES.map((m) => (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                key={m}
                onClick={() => playRound(m)}
                disabled={replayMode || seriesWinner !== null}
                className="bg-card hover:bg-primary/20 border-2 border-border hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-colors h-32 shadow-lg"
              >
                <span className="text-4xl">{MOVE_ICONS[m]}</span>
                <span className="font-bold tracking-wider uppercase text-sm">{m}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* RIGHT: History */}
        <div className="flex flex-col gap-4 order-3">
          <Card className="p-4 bg-card border-border flex-1 flex flex-col max-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-primary uppercase tracking-wider">History</h2>
              <Button variant="outline" size="sm" onClick={toggleReplay} disabled={history.length === 0}
                className={replayMode ? "bg-primary text-primary-foreground border-primary" : ""}>
                {replayMode ? "Close Replay" : "Replay"}
              </Button>
            </div>
            <ScrollArea className="flex-1 border rounded-md bg-background/50 border-border p-2">
              {history.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground text-sm italic">No rounds played yet.</div>
              ) : (
                <div className="flex flex-col gap-2">
                  {history.map((h, i) => (
                    <div key={i} className="text-xs p-2 rounded bg-card border border-border/50 flex justify-between items-center">
                      <span className="font-mono text-muted-foreground">R{h.round.toString().padStart(2, '0')}</span>
                      <span className="flex-1 text-center font-medium">{h.playerMove} v {h.cpuMove}</span>
                      <span className={`font-bold w-12 text-right ${
                        h.result === "Win" ? "text-green-500" : h.result === "Lose" ? "text-destructive" : "text-yellow-500"
                      }`}>
                        {h.result === "Win" ? "WIN" : h.result === "Lose" ? "LOSE" : "DRAW"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

      </div>
    </div>
  );
}
