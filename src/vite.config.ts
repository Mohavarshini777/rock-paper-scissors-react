

Overview

Logs

Analytics

Resources

Domains

Manage

Republish

Adjust settings

Run security scan

Deploy with the Replit App!

Your published app will expire in 29 days. Upgrade to keep your published app running.

Upgrade to Core
Production
Status
Usingid115 published about 1 hour ago

Visibility
Public
SEO score
100 / 100
Good
Geography
North America
Type
Autoscale
(2 vCPU / 4 GiB RAM / 1 Max)
See all usage
Expiration
6/11/2026
Rock Paper Scissors
rock-paper-scissors--usingid115.replit.app 
Published your App


import random
import json
import os
import tkinter as tk
from tkinter import ttk, messagebox, font
from datetime import datetime

─────────────────────────────────────────────
ASCII ART
─────────────────────────────────────────────
ROCK = """
_______
---' )
()
()
()
---.(_)
"""

PAPER = """
_______
---' )
_____)
_____)
)
---.)
"""

SCISSORS = """
_______
---' )
_____)
__)
()
---.()
"""

GAME_IMAGES = [ROCK, PAPER, SCISSORS]
EMOJIS = ["🪨 Rock", "📄 Paper", "✂️ Scissors"]
LABELS = ["Rock", "Paper", "Scissors"]

STATS_FILE = "rps_stats.json"

─────────────────────────────────────────────
CORE GAME LOGIC (no I/O, pure functions)
─────────────────────────────────────────────
def get_computer_choice(difficulty: str) -> int:
"""Return computer's choice index based on difficulty."""
return random.randint(0, 2) # Easy / Medium / Hard all random for now
# (Hard could use a Markov chain on history — hook left for extension)

def evaluate_round(user: int, comp: int) -> str:
"""Return 'win', 'lose', or 'draw'."""
if user == comp:
return "draw"
wins = {(0, 2), (1, 0), (2, 1)} # (user, comp) pairs that are user-wins
return "win" if (user, comp) in wins else "lose"

─────────────────────────────────────────────
STATS / FILE SAVE SYSTEM
─────────────────────────────────────────────
def load_stats() -> dict:
"""Load persistent stats from JSON file."""
if os.path.exists(STATS_FILE):
try:
with open(STATS_FILE, "r") as f:
return json.load(f)
except (json.JSONDecodeError, IOError):
pass
return {"wins": 0, "losses": 0, "draws": 0, "sessions": 0}

def save_stats(stats: dict) -> None:
"""Persist stats to JSON file."""
try:
with open(STATS_FILE, "w") as f:
json.dump(stats, f, indent=2)
except IOError as e:
print(f"[Warning] Could not save stats: {e}")

─────────────────────────────────────────────
GUI APPLICATION
─────────────────────────────────────────────
class RockPaperScissorsApp(tk.Tk):
# ── Colour palette ──────────────────────
BG = "#0f0f1a"
CARD = "#1a1a2e"
ACCENT = "#e94560"
ACCENT2 = "#0f3460"
FG = "#eaeaea"
FG_DIM = "#888"
WIN_CLR = "#2ecc71"
LOSE_CLR = "#e74c3c"
DRAW_CLR = "#f39c12"
BTN_HOV = "#c0392b"

def __init__(self):
    super().__init__()
    self.title("Rock · Paper · Scissors")
    self.resizable(False, False)
    self.configure(bg=self.BG)
    # ── state ──────────────────────────
    self.difficulty   = tk.StringVar(value="Easy")
    self.mode         = tk.StringVar(value="Classic")   # Classic | Best of 3
    self.user_score   = 0
    self.comp_score   = 0
    self.round_num    = 0
    self.bo3_user     = 0    # best-of-3 series wins
    self.bo3_comp     = 0
    self.history      = []
    self.stats        = load_stats()
    self.replay_data  = []   # list of (user_idx, comp_idx, result) for replay
    self._build_ui()
    self._update_scoreboard()
    self._update_stats_panel()
# ──────────────────────────────────────
#  UI CONSTRUCTION
# ──────────────────────────────────────
def _build_ui(self):
    # Title
    tk.Label(self, text="ROCK · PAPER · SCISSORS",
             font=("Courier New", 18, "bold"),
             bg=self.BG, fg=self.ACCENT).pack(pady=(18, 4))
    # ── Settings row ──────────────────
    settings = tk.Frame(self, bg=self.BG)
    settings.pack(pady=4)
    tk.Label(settings, text="Difficulty:", bg=self.BG,
             fg=self.FG_DIM, font=("Courier New", 10)).grid(row=0, col=0, padx=6)
    for txt in ("Easy", "Medium", "Hard"):
        tk.Radiobutton(settings, text=txt, variable=self.difficulty, value=txt,
                       bg=self.BG, fg=self.FG, selectcolor=self.ACCENT2,
                       activebackground=self.BG, activeforeground=self.ACCENT,
                       font=("Courier New", 10)).grid(row=0, column={"Easy":1,"Medium":2,"Hard":3}[txt], padx=4)
    tk.Label(settings, text="  Mode:", bg=self.BG,
             fg=self.FG_DIM, font=("Courier New", 10)).grid(row=0, column=4, padx=6)
    for txt in ("Classic", "Best of 3"):
        tk.Radiobutton(settings, text=txt, variable=self.mode, value=txt,
                       command=self._reset_game,
                       bg=self.BG, fg=self.FG, selectcolor=self.ACCENT2,
                       activebackground=self.BG, activeforeground=self.ACCENT,
                       font=("Courier New", 10)).grid(row=0, column={"Classic":5,"Best of 3":6}[txt], padx=4)
    # ── ASCII display area ─────────────
    ascii_row = tk.Frame(self, bg=self.BG)
    ascii_row.pack(pady=6)
    lf = tk.LabelFrame(ascii_row, text=" You ", bg=self.CARD,
                       fg=self.ACCENT, font=("Courier New", 10, "bold"),
                       bd=1, relief="solid")
    lf.grid(row=0, column=0, padx=20)
    self.user_ascii = tk.Label(lf, text="", font=("Courier New", 9),
                               bg=self.CARD, fg=self.FG, justify="left", width=18)
    self.user_ascii.pack(padx=8, pady=4)
    cf = tk.LabelFrame(ascii_row, text=" Computer ", bg=self.CARD,
                       fg=self.ACCENT2, font=("Courier New", 10, "bold"),
                       bd=1, relief="solid")
    cf.grid(row=0, column=1, padx=20)
    self.comp_ascii = tk.Label(cf, text="", font=("Courier New", 9),
                               bg=self.CARD, fg=self.FG, justify="left", width=18)
    self.comp_ascii.pack(padx=8, pady=4)
    # ── Result label ──────────────────
    self.result_var = tk.StringVar(value="Choose your move!")
    tk.Label(self, textvariable=self.result_var,
             font=("Courier New", 14, "bold"),
             bg=self.BG, fg=self.FG).pack(pady=6)
    # ── Scoreboard ────────────────────
    sb = tk.Frame(self, bg=self.CARD, bd=0)
    sb.pack(pady=4, ipadx=20, ipady=6)
    self.score_var = tk.StringVar()
    tk.Label(sb, textvariable=self.score_var,
             font=("Courier New", 11, "bold"),
             bg=self.CARD, fg=self.FG).pack(padx=30)
    self.bo3_var = tk.StringVar()
    self.bo3_label = tk.Label(sb, textvariable=self.bo3_var,
                              font=("Courier New", 10),
                              bg=self.CARD, fg=self.DRAW_CLR)
    self.bo3_label.pack()
    # ── Move buttons ──────────────────
    btn_row = tk.Frame(self, bg=self.BG)
    btn_row.pack(pady=10)
    self.move_buttons = []
    btn_data = [("🪨\nRock", 0), ("📄\nPaper", 1), ("✂️\nScissors", 2)]
    for (label, idx) in btn_data:
        b = tk.Button(btn_row, text=label,
                      font=("Courier New", 12, "bold"),
                      bg=self.ACCENT2, fg=self.FG,
                      activebackground=self.ACCENT, activeforeground=self.FG,
                      relief="flat", bd=0, width=9, height=3, cursor="hand2",
                      command=lambda i=idx: self._play_round(i))
        b.pack(side="left", padx=10)
        b.bind("<Enter>", lambda e, btn=b: btn.configure(bg=self.ACCENT))
        b.bind("<Leave>", lambda e, btn=b: btn.configure(bg=self.ACCENT2))
        self.move_buttons.append(b)
    # ── Utility buttons ───────────────
    util_row = tk.Frame(self, bg=self.BG)
    util_row.pack(pady=4)
    for (txt, cmd) in [("📜 History", self._show_history),
                        ("▶ Replay", self._replay_game),
                        ("📊 Stats", self._show_stats),
                        ("🔄 Reset", self._reset_game)]:
        tk.Button(util_row, text=txt, font=("Courier New", 10),
                  bg=self.CARD, fg=self.FG, relief="flat", bd=0,
                  activebackground=self.ACCENT2, activeforeground=self.FG,
                  cursor="hand2", command=cmd, padx=10, pady=4
                  ).pack(side="left", padx=6)
    # ── Status bar ────────────────────
    self.status_var = tk.StringVar(value="Ready — pick a move!")
    tk.Label(self, textvariable=self.status_var,
             font=("Courier New", 9), bg=self.BG,
             fg=self.FG_DIM).pack(pady=(4, 10))
# ──────────────────────────────────────
#  GAME LOGIC
# ──────────────────────────────────────
def _play_round(self, user_idx: int):
    """Handle one round of gameplay."""
    try:
        comp_idx = self._computer_choice(user_idx)
        outcome  = evaluate_round(user_idx, comp_idx)
        self.round_num += 1
        self.replay_data.append((user_idx, comp_idx, outcome))
        # Update session scores
        if outcome == "win":
            self.user_score += 1
            self.stats["wins"] += 1
            result_text = "You Win! 🏆"
            colour = self.WIN_CLR
        elif outcome == "lose":
            self.comp_score += 1
            self.stats["losses"] += 1
            result_text = "You Lose 😢"
            colour = self.LOSE_CLR
        else:
            self.stats["draws"] += 1
            result_text = "It's a Draw 🤝"
            colour = self.DRAW_CLR
        save_stats(self.stats)
        # Update displays
        self.user_ascii.configure(text=GAME_IMAGES[user_idx])
        self.comp_ascii.configure(text=GAME_IMAGES[comp_idx])
        self.result_var.set(result_text)
        self.result_var_colour = colour
        # Recolour result label
        for w in self.pack_slaves():
            if isinstance(w, tk.Label) and w.cget("textvariable") == str(self.result_var):
                w.configure(fg=colour)
        # simpler: find by searching children
        self._set_result_colour(colour)
        # History entry
        entry = (f"R{self.round_num:02d} | You: {LABELS[user_idx]:8s} "
                 f"vs CPU: {LABELS[comp_idx]:8s}  →  {result_text}")
        self.history.append(entry)
        self._update_scoreboard()
        self._update_stats_panel()
        self.status_var.set(
            f"Round {self.round_num} — {LABELS[user_idx]} vs {LABELS[comp_idx]}")
        # Best-of-3 check
        if self.mode.get() == "Best of 3":
            self._check_bo3(outcome)
    except Exception as e:
        messagebox.showerror("Error", f"An unexpected error occurred:\n{e}")
def _computer_choice(self, user_idx: int) -> int:
    """Computer choice adjusted for difficulty."""
    diff = self.difficulty.get()
    if diff == "Easy":
        return random.randint(0, 2)
    elif diff == "Medium":
        # 30 % chance computer picks the winning move against user
        if random.random() < 0.30:
            winning = {0: 1, 1: 2, 2: 0}   # paper beats rock, etc.
            return winning[user_idx]
        return random.randint(0, 2)
    else:  # Hard
        # 55 % chance computer counters the user
        if random.random() < 0.55:
            winning = {0: 1, 1: 2, 2: 0}
            return winning[user_idx]
        return random.randint(0, 2)
def _check_bo3(self, outcome: str):
    """Handle best-of-3 series logic."""
    if outcome == "win":
        self.bo3_user += 1
    elif outcome == "lose":
        self.bo3_comp += 1
    self.bo3_var.set(f"Series: You {self.bo3_user} – {self.bo3_comp} CPU")
    if self.bo3_user == 2:
        messagebox.showinfo("Best of 3 — Series Over",
                            "🏆 You won the series! Starting a new one.")
        self.bo3_user = self.bo3_comp = 0
    elif self.bo3_comp == 2:
        messagebox.showinfo("Best of 3 — Series Over",
                            "😢 CPU won the series! Starting a new one.")
        self.bo3_user = self.bo3_comp = 0
    self.bo3_var.set(f"Series: You {self.bo3_user} – {self.bo3_comp} CPU")
def _set_result_colour(self, colour: str):
    """Walk widget tree to colour the result label."""
    for widget in self.winfo_children():
        if isinstance(widget, tk.Label):
            try:
                if widget.cget("textvariable"):
                    widget.configure(fg=colour)
                    return
            except Exception:
                pass
# ──────────────────────────────────────
#  SCOREBOARD & STATS
# ──────────────────────────────────────
def _update_scoreboard(self):
    self.score_var.set(
        f"You: {self.user_score}   |   CPU: {self.comp_score}   "
        f"|   Round: {self.round_num}")
    if self.mode.get() != "Best of 3":
        self.bo3_var.set("")
def _update_stats_panel(self):
    pass  # Stats shown in dedicated popup
# ──────────────────────────────────────
#  POPUP WINDOWS
# ──────────────────────────────────────
def _show_history(self):
    """Display match history in a scrollable window."""
    win = tk.Toplevel(self)
    win.title("Match History")
    win.configure(bg=self.BG)
    win.resizable(False, False)
    tk.Label(win, text="📜 Match History", font=("Courier New", 13, "bold"),
             bg=self.BG, fg=self.ACCENT).pack(pady=10)
    frame = tk.Frame(win, bg=self.BG)
    frame.pack(padx=10, pady=4)
    sb = tk.Scrollbar(frame, orient="vertical")
    lb = tk.Listbox(frame, yscrollcommand=sb.set,
                    font=("Courier New", 10), bg=self.CARD, fg=self.FG,
                    selectbackground=self.ACCENT2, width=55, height=15,
                    bd=0, highlightthickness=0)
    sb.config(command=lb.yview)
    sb.pack(side="right", fill="y")
    lb.pack(side="left")
    if self.history:
        for item in self.history:
            lb.insert("end", item)
        lb.yview_moveto(1.0)
    else:
        lb.insert("end", "  No rounds played yet.")
    tk.Label(win, text=f"Session total — You: {self.user_score}  CPU: {self.comp_score}",
             font=("Courier New", 10), bg=self.BG, fg=self.FG_DIM).pack(pady=6)
    tk.Button(win, text="Close", command=win.destroy,
              bg=self.ACCENT2, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=14, pady=4,
              cursor="hand2").pack(pady=(0, 10))
def _show_stats(self):
    """Display all-time statistics."""
    win = tk.Toplevel(self)
    win.title("Statistics")
    win.configure(bg=self.BG)
    win.resizable(False, False)
    tk.Label(win, text="📊 All-Time Statistics",
             font=("Courier New", 13, "bold"),
             bg=self.BG, fg=self.ACCENT).pack(pady=12)
    s = self.stats
    total = s["wins"] + s["losses"] + s["draws"]
    win_pct = (s["wins"] / total * 100) if total else 0
    rows = [
        ("Total Rounds Played", total),
        ("Wins 🏆",             s["wins"]),
        ("Losses 😢",           s["losses"]),
        ("Draws 🤝",            s["draws"]),
        ("Win Rate",            f"{win_pct:.1f}%"),
        ("Sessions Played",     s.get("sessions", 0)),
    ]
    frame = tk.Frame(win, bg=self.CARD)
    frame.pack(padx=20, pady=6, ipadx=16, ipady=8)
    for i, (lbl, val) in enumerate(rows):
        tk.Label(frame, text=lbl, font=("Courier New", 11),
                 bg=self.CARD, fg=self.FG_DIM, anchor="w", width=22
                 ).grid(row=i, column=0, sticky="w", pady=2, padx=8)
        tk.Label(frame, text=str(val), font=("Courier New", 11, "bold"),
                 bg=self.CARD, fg=self.FG, anchor="e", width=10
                 ).grid(row=i, column=1, sticky="e", pady=2, padx=8)
    def reset_stats():
        if messagebox.askyesno("Reset Stats", "Reset all-time statistics?"):
            self.stats = {"wins": 0, "losses": 0, "draws": 0, "sessions": 0}
            save_stats(self.stats)
            win.destroy()
    tk.Button(win, text="🗑 Reset Stats", command=reset_stats,
              bg=self.LOSE_CLR, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=10, pady=4,
              cursor="hand2").pack(side="left", padx=14, pady=10)
    tk.Button(win, text="Close", command=win.destroy,
              bg=self.ACCENT2, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=14, pady=4,
              cursor="hand2").pack(side="right", padx=14, pady=10)
def _replay_game(self):
    """Replay all rounds of the current session step-by-step."""
    if not self.replay_data:
        messagebox.showinfo("Replay", "No rounds to replay yet!")
        return
    win = tk.Toplevel(self)
    win.title("Replay")
    win.configure(bg=self.BG)
    win.resizable(False, False)
    tk.Label(win, text="▶  Session Replay",
             font=("Courier New", 13, "bold"),
             bg=self.BG, fg=self.ACCENT).pack(pady=10)
    idx_var   = tk.IntVar(value=0)
    round_var = tk.StringVar()
    user_asc  = tk.StringVar()
    comp_asc  = tk.StringVar()
    res_var   = tk.StringVar()
    def show_step(n):
        total = len(self.replay_data)
        if n < 0:  n = 0
        if n >= total: n = total - 1
        idx_var.set(n)
        u, c, r = self.replay_data[n]
        round_var.set(f"Round {n+1} / {total}")
        user_asc.set(GAME_IMAGES[u])
        comp_asc.set(GAME_IMAGES[c])
        labels = {"win": "You Win! 🏆", "lose": "You Lose 😢", "draw": "Draw 🤝"}
        res_var.set(labels[r])
    tk.Label(win, textvariable=round_var,
             font=("Courier New", 11), bg=self.BG, fg=self.FG).pack()
    asc_row = tk.Frame(win, bg=self.BG)
    asc_row.pack(pady=4)
    tk.Label(asc_row, text="You", font=("Courier New", 9, "bold"),
             bg=self.BG, fg=self.ACCENT).grid(row=0, column=0, padx=20)
    tk.Label(asc_row, text="CPU", font=("Courier New", 9, "bold"),
             bg=self.BG, fg=self.ACCENT2).grid(row=0, column=1, padx=20)
    tk.Label(asc_row, textvariable=user_asc,
             font=("Courier New", 9), bg=self.BG, fg=self.FG,
             justify="left").grid(row=1, column=0, padx=20)
    tk.Label(asc_row, textvariable=comp_asc,
             font=("Courier New", 9), bg=self.BG, fg=self.FG,
             justify="left").grid(row=1, column=1, padx=20)
    tk.Label(win, textvariable=res_var,
             font=("Courier New", 12, "bold"),
             bg=self.BG, fg=self.WIN_CLR).pack(pady=6)
    nav = tk.Frame(win, bg=self.BG)
    nav.pack(pady=6)
    tk.Button(nav, text="◀ Prev",
              command=lambda: show_step(idx_var.get() - 1),
              bg=self.ACCENT2, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=10, cursor="hand2"
              ).pack(side="left", padx=8)
    tk.Button(nav, text="Next ▶",
              command=lambda: show_step(idx_var.get() + 1),
              bg=self.ACCENT2, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=10, cursor="hand2"
              ).pack(side="left", padx=8)
    tk.Button(nav, text="Close", command=win.destroy,
              bg=self.CARD, fg=self.FG, relief="flat",
              font=("Courier New", 10), padx=10, cursor="hand2"
              ).pack(side="left", padx=8)
    show_step(0)
# ──────────────────────────────────────
#  RESET
# ──────────────────────────────────────
def _reset_game(self):
    """Reset session scores and history."""
    self.user_score = self.comp_score = self.round_num = 0
    self.bo3_user   = self.bo3_comp   = 0
    self.history.clear()
    self.replay_data.clear()
    self.stats["sessions"] = self.stats.get("sessions", 0) + 1
    save_stats(self.stats)
    self.user_ascii.configure(text="")
    self.comp_ascii.configure(text="")
    self.result_var.set("Choose your move!")
    self.bo3_var.set("")
    self._update_scoreboard()
    self.status_var.set("Game reset — good luck!")
# ──────────────────────────────────────
#  WINDOW CLOSE
# ──────────────────────────────────────
def on_close(self):
    self.stats["sessions"] = self.stats.get("sessions", 0) + 1
    save_stats(self.stats)
    self.destroy()

─────────────────────────────────────────────
ENTRY POINT
─────────────────────────────────────────────
def main():
try:
app = RockPaperScissorsApp()
app.protocol("WM_DELETE_WINDOW", app.on_close)
app.mainloop()
except Exception as e:
print(f"Fatal error: {e}")
raise

if name == "main":
main()


Show more
55 minutes ago

3 messages & 19 actions

Presented output
Rock Paper Scissors
Website

Open

1 message & 1 action

Checkpoint made
52 minutes ago

Worked for 3 minutes
WHERE IS THE CODE

48 minutes ago

1 message & 3 actions

Worked for 20 seconds
YES OK CAN I GET THE FULL CODE

47 minutes ago

1 message & 5 actions

Published your app
45 minutes ago

1 message & 1 action

Worked for 1 minute
package.json
vite.config.ts
tailwind.config.js
tsconfig.json ineed this files

2 minutes ago

6 actions
Here are all four files:

package.json

{
  "name": "@workspace/rps-game",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --config vite.config.ts --host 0.0.0.0",
    "build": "vite build --config vite.config.ts",
    "serve": "vite preview --config vite.config.ts --host 0.0.0.0",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "devDependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.4",
    "@radix-ui/react-alert-dialog": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.4",
    "@radix-ui/react-checkbox": "^1.1.5",
    "@radix-ui/react-dialog": "^1.1.7",
    "@radix-ui/react-dropdown-menu": "^2.1.7",
    "@radix-ui/react-label": "^2.1.3",
    "@radix-ui/react-radio-group": "^1.2.4",
    "@radix-ui/react-scroll-area": "^1.2.4",
    "@radix-ui/react-select": "^2.1.7",
    "@radix-ui/react-slot": "^1.2.0",
    "@radix-ui/react-toast": "^1.2.7",
    "@radix-ui/react-tooltip": "^1.2.0",
    "@replit/vite-plugin-cartographer": "catalog:",
    "@replit/vite-plugin-dev-banner": "catalog:",
    "@replit/vite-plugin-runtime-error-modal": "catalog:",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "catalog:",
    "@tanstack/react-query": "catalog:",
    "@types/node": "catalog:",
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@vitejs/plugin-react": "catalog:",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "framer-motion": "catalog:",
    "lucide-react": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:",
    "react-hook-form": "^7.55.0",
    "react-icons": "^5.4.0",
    "tailwind-merge": "catalog:",
    "tailwindcss": "catalog:",
    "tw-animate-css": "^1.4.0",
    "vite": "catalog:",
    "wouter": "^3.3.5",
    "zod": "catalog:"
  }
}

vite.config.ts
