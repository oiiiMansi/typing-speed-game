import { useEffect, useState } from "react";
import "./App.css";
import { typingTexts } from "./data/texts";

const TIME_OPTIONS = [15, 30, 60];

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    description: "Simple words",
  },
  medium: {
    label: "Medium",
    description: "Normal difficulty",
  },
  hard: {
    label: "Hard",
    description: "Longer & complex",
  },
};

const getRandomText = (difficulty) => {
  const filteredTexts = typingTexts.filter(
    (item) => item.difficulty === difficulty
  );

  const randomIndex = Math.floor(
    Math.random() * filteredTexts.length
  );

  return filteredTexts[randomIndex].text;
};

function App() {
  const [input, setInput] = useState("");
  const [sampleText, setSampleText] = useState(
    getRandomText("medium")
  );

  const [selectedTime, setSelectedTime] = useState(30);
  const [time, setTime] = useState(30);

  const [difficulty, setDifficulty] = useState("medium");

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

  // Start typing
  const handleChange = (event) => {
    if (finished) return;

    const value = event.target.value;

    if (!started) {
      setStarted(true);
    }

    setInput(value);

    if (value.length >= sampleText.length) {
      setFinished(true);
    }
  };

  // Change time
  const handleTimeChange = (newTime) => {
    if (started) return;

    setSelectedTime(newTime);
    setTime(newTime);
  };

  // Change difficulty
  const handleDifficultyChange = (newDifficulty) => {
    if (started) return;

    setDifficulty(newDifficulty);
    setSampleText(getRandomText(newDifficulty));
  };

  // Restart
  const resetGame = () => {
    setInput("");
    setTime(selectedTime);
    setStarted(false);
    setFinished(false);
    setSampleText(getRandomText(difficulty));
  };

  // Correct characters
  const correctCharacters = input
    .split("")
    .filter((char, index) => char === sampleText[index]).length;

  // Errors
  const errors = input.length - correctCharacters;

  // Accuracy
  const accuracy =
    input.length > 0
      ? Math.round((correctCharacters / input.length) * 100)
      : 100;

  // Words
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;

  // Time used
  const timeUsed = selectedTime - time;

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
          <span>{selectedTime} SEC</span>
          <span>•</span>
          <span>{difficulty.toUpperCase()}</span>
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
              : "Choose your settings and start typing."}
          </p>
        </div>

        {/* SETTINGS */}
        {!started && !finished && (
          <div className="settings">

            <div className="setting-group">
              <span className="setting-label">
                DIFFICULTY
              </span>

              <div className="options">
                {Object.entries(DIFFICULTIES).map(
                  ([key, value]) => (
                    <button
                      key={key}
                      className={
                        difficulty === key
                          ? "option active"
                          : "option"
                      }
                      onClick={() =>
                        handleDifficultyChange(key)
                      }
                    >
                      <strong>{value.label}</strong>
                      <small>{value.description}</small>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="setting-group">
              <span className="setting-label">
                TIME
              </span>

              <div className="time-options">
                {TIME_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={
                      selectedTime === option
                        ? "time-option active"
                        : "time-option"
                    }
                    onClick={() =>
                      handleTimeChange(option)
                    }
                  >
                    {option}s
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

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

          <div className="stat">
            <span>ERRORS</span>
            <strong>{errors}</strong>
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

              if (
                index === input.length &&
                !finished
              ) {
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
                ? "Test finished — click Restart."
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
              ? `You typed ${words} words with ${accuracy}% accuracy and made ${errors} errors.`
              : "Focus on accuracy first. Speed will come naturally."}
          </p>
        </div>
        {finished && (
          <div className="results-message">
            <p className="results-label">
              FINAL RESULT
            </p>

            <h2>
              {wpm} WPM
            </h2>

            <p>
              {accuracy}% accuracy · {errors} errors
            </p>
          </div>
        )}

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