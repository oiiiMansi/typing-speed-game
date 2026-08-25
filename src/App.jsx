import { useEffect, useState } from "react";
import "./App.css";
import { typingTexts } from "./data/texts";


const GAME_TIME = 30;

const getRandomText = () => {
  const randomIndex = Math.floor(Math.random() * typingTexts.length);
  return typingTexts[randomIndex];
};

function App() {
  const [input, setInput] = useState("");
  const [sampleText, setSampleText] = useState(getRandomText);
  const [time, setTime] = useState(GAME_TIME);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  // Timer
  useEffect(() => {
    if (!started || finished || time <= 0) return;

    const timer = setInterval(() => {
      setTime((currentTime) => {
        if (currentTime <= 1) {
          setFinished(true);
          return 0;
        }

        return currentTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, time]);

  // Typing handler
  const handleChange = (event) => {
    if (finished) return;

    const value = event.target.value;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    // Finish if the whole sentence is typed
    if (value.length >= sampleText.length) {
      setFinished(true);
    }
  };

  // Restart
 const resetGame = () => {
  setInput("");
  setTime(GAME_TIME);
  setStarted(false);
  setFinished(false);
  setSampleText(getRandomText());
};

  // Correct characters
  const correctCharacters = input
    .split("")
    .filter((char, index) => char === sampleText[index]).length;

  // Accuracy
  const accuracy =
    input.length > 0
      ? Math.round((correctCharacters / input.length) * 100)
      : 100;

  // Words typed
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  // Time used
  const timeUsed = GAME_TIME - time;

  // WPM
  const wpm =
    timeUsed > 0
      ? Math.round(words / (timeUsed / 60))
      : 0;

  return (
    <main className="app">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <span className="logo-mark">&gt;_</span>
          <span>TypeRush</span>
        </div>

        <div className="header-info">
          <span>30 SEC</span>
          <span>•</span>
          <span>ENGLISH</span>
        </div>
      </header>

      {/* GAME */}
      <section className="game-container">

        <div className="game-title">
          <p className="eyebrow">TYPING SPEED TEST</p>

          <h1>
            {finished
              ? "Test complete!"
              : "How fast can you type?"}
          </h1>

          <p className="subtitle">
            {finished
              ? "Here's how you performed."
              : "Type the text below as quickly and accurately as you can."}
          </p>
        </div>

        {/* STATS */}
        <div className="stats">

          <div className="stat">
            <span>TIME</span>
            <strong>{time}s</strong>
          </div>

          <div className="stat">
            <span>WPM</span>
            <strong>{wpm}</strong>
          </div>

          <div className="stat">
            <span>ACCURACY</span>
            <strong>{accuracy}%</strong>
          </div>

        </div>

        {/* TYPING CARD */}
        <div className="typing-card">

          <div className="text-display">
            {sampleText.split("").map((char, index) => {

              let className = "";

              if (index < input.length) {
                className =
                  input[index] === char
                    ? "correct"
                    : "incorrect";
              }

              if (index === input.length && !finished) {
                className = "current";
              }

              return (
                <span
                  key={index}
                  className={className}
                >
                  {char}
                </span>
              );
            })}
          </div>

          <textarea
            value={input}
            onChange={handleChange}
            placeholder={
              finished
                ? "Test finished — click Restart to try again."
                : "Start typing here..."
            }
            spellCheck="false"
            autoFocus
            disabled={finished}
          />

          <div className="card-footer">

            <span>
              {input.length} / {sampleText.length} characters
            </span>

            <button onClick={resetGame}>
              Restart
            </button>

          </div>

        </div>

        {/* TIP */}
        <div className="keyboard-hint">
          <span>TIP</span>

          <p>
            {finished
              ? `You typed ${words} words with ${accuracy}% accuracy.`
              : "Focus on accuracy first. Speed will come naturally."}
          </p>
        </div>

      </section>

      {/* FOOTER */}
      <footer>
        <span>TypeRush</span>
        <span>Built with React + Vite</span>
      </footer>

    </main>
  );
}

export default App;