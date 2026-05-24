# You Can't Say "Umm..." -- Multiplayer Party Game
- This is a website version of the board game "You Can't Say "Umm..."
- Was kind of too broke and lazy to buy the board game so why not build it online so that me and my friends could play it anytime anywhere!?

# About

A chaotic real-time multiplayer party game where teams race across the board by describing random word combinations — without saying filler words like **“um”** or **“uh.”**

Players join from their own devices using a room code while playing together in person.

Ding the opposing team when they slip up, survive absurd rule cards, and make it through the Danger Zone to win.

---

# 🌐 Online Multiplayer Features

- Real-time cross-device multiplayer
- Join games using a room code
- Supports 2 or more teams
- Live board synchronization
- Shared timer and scoring
- Responsive for phones, tablets, and laptops

---

# 🛠 Setup

1. One player creates a game room
2. A unique room code is generated
3. Other players join using the room code
4. Teams choose:
   - a team name
   - a team color
5. All team pawns begin on the **START** square

Before the game starts:
- Rule Cards are shuffled
- Each team receives **6 Rule Cards**
- Teams secretly choose **3** cards to give another team
- Remaining cards are discarded

---

# ⏱ Gameplay

Teams take turns.

During a turn:

1. One player becomes the **Describer**
2. The rest of the team becomes the **Guessers**
3. The describer receives:
   - one word from pile A
   - one word from pile B

Example:

```txt
Clumsy Jelly
```

4. A **45-second timer** begins
5. The describer must help their team guess the full phrase in the correct order
6. Teams may attempt multiple word pairs before time runs out

---

# Scoring

## Correct Guess
If the team correctly guesses the phrase:
- their pawn moves forward **1 space**

## Getting Dinged
Opposing teams listen carefully.

If the describer:
- says “um”
- says “uh”
- stutters
- makes filler noises
- breaks an active rule

another team may press the **DING** button.

When dinged:
- the opposing team moves forward **1 space**

---

# 🟨 Yellow Rule Spaces
Every 5th square on the board is a **Yellow Rule Space**.

When a team lands on or passes a yellow square:
- one hidden Rule Card is revealed
- that rule becomes active permanently

Breaking active rules allows other teams to ding.

---

# Example Rule Cards
- Cannot say words beginning with “S”
- Cannot say “it’s”
- Must speak in a high-pitched voice
- Cannot use hand gestures
- Must maintain eye contact
- Must clap before speaking
- Must narrate like a sports commentator
- Must whisper dramatically

---

# ⚠ Danger Zone
The final section of the board is the **Danger Zone**.

In the Danger Zone:
- BOTH describers and guessers cannot say:
  - “um”
  - “uh”
  - filler noises

This makes the final stretch much more chaotic.

---

# 🏆 Winning
The first team to reach the final square wins the game.

---

# Built With
- React
- Vite
- Tailwind CSS
- Framer Motion
- Firebase Realtime Database
- AI (Claude Code, ChatGPT)