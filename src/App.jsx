import { useEffect, useRef, useState } from "react";
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
  const textareaRef = useRef(null);
  const countdownRef = useRef(null);

  const [input, setInput] = useState("");
  const [sampleText, setSampleText] = useState(
    getRandomText("medium")
  );

  const [selectedTime, setSelectedTime] = useState(30);
  const [time, setTime] = useState(30);

  const [difficulty, setDifficulty] = useState("medium");

  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [bestWpm, setBestWpm] = useState(() => {
    return Number(localStorage.getItem("typerush-best-wpm")) || 0;
  });

  // =========================
  // TIMER
  // =========================

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

  // =========================
  // TYPING
  // =========================

  const handleChange = (event) => {
    if (finished || countdown !== null) return;

    const value = event.target.value;

    setInput(value);

    // Finish when entire text is typed
    if (value.length >= sampleText.length) {
      setFinished(true);
    }
  };

  // =========================
  // TIME SELECTION
  // =========================

  const handleTimeChange = (newTime) => {
    if (started || countdown !== null) return;

    setSelectedTime(newTime);
    setTime(newTime);
  };

  // =========================
  // DIFFICULTY
  // =========================

  const handleDifficultyChange = (newDifficulty) => {
    if (started || countdown !== null) return;

    setDifficulty(newDifficulty);
    setSampleText(getRandomText(newDifficulty));
  };

  // =========================
  // START COUNTDOWN
  // =========================

  const startGame = () => {
    if (started || finished || countdown !== null) return;

    setCountdown(3);

    let current = 3;

    countdownRef.current = setInterval(() => {
      current -= 1;

      if (current === 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;

        setCountdown(null);
        setStarted(true);

        return;
      }

      setCountdown(current);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // =========================
  // FOCUS AFTER COUNTDOWN
  // =========================

  useEffect(() => {
    if (started && !finished) {
      textareaRef.current?.focus();
    }
  }, [started, finished]);

  // =========================
  // RESTART
  // =========================

  const resetGame = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setInput("");
    setTime(selectedTime);
    setStarted(false);
    setFinished(false);
    setCountdown(null);
    setSampleText(getRandomText(difficulty));

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // =========================
  // KEYBOARD SHORTCUTS
  // =========================

  useEffect(() => {
    const handleKeyboard = (event) => {
      // ESC = restart
      if (event.key === "Escape") {
        resetGame();
      }

      // ENTER / TAB = restart after finishing
      if (
        (event.key === "Enter" || event.key === "Tab") &&
        finished
      ) {
        event.preventDefault();
        resetGame();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [finished]);

  // =========================
  // STATS
  // =========================

  const correctCharacters = input
    .split("")
    .filter(
      (char, index) => char === sampleText[index]
    ).length;

  const errors = input.length - correctCharacters;

  const accuracy =
    input.length > 0
      ? Math.round(
        (correctCharacters / input.length) * 100
      )
      : 100;

  const words = input.trim()
    ? input.trim().split(/\s+/).length
    : 0;

  const timeUsed = selectedTime - time;

  const wpm =
    timeUsed > 0
      ? Math.round(
        words / (timeUsed / 60)
      )
      : 0;

  const progress =
    sampleText.length > 0
      ? Math.min(
        Math.round(
          (input.length / sampleText.length) * 100
        ),
        100
      )
      : 0;

  // Update personal best
  useEffect(() => {
    if (!finished || wpm <= 0) return;

    if (wpm > bestWpm) {
      setBestWpm(wpm);
      localStorage.setItem(
        "typerush-best-wpm",
        wpm
      );
    }
  }, [finished, wpm, bestWpm]);

  // =========================
  // UI
  // =========================

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

        {/* TITLE */}
        <div className="game-title">

          <p className="eyebrow">
            TYPING SPEED TEST
          </p>

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

            {/* DIFFICULTY */}
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

                      <strong>
                        {value.label}
                      </strong>

                      <small>
                        {value.description}
                      </small>

                    </button>

                  )
                )}

              </div>

            </div>

            {/* START BUTTON */}
            <button
              className="start-button"
              onClick={startGame}
            >
              START TEST
            </button>

            {/* TIME */}
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

        {/* COUNTDOWN */}
        {countdown !== null && (
          <div className="countdown">
            {countdown}
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

          <div className="stat best-stat">
            <span>BEST</span>
            <strong>{bestWpm}</strong>
          </div>

        </div>

        {/* TYPING CARD */}
        <div className="typing-card">
          <div className="progress-container">
            <div className="progress-info">
              <span>PROGRESS</span>
              <span>{progress}%</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* SAMPLE TEXT */}
          <div className="text-display">

            {sampleText.split("").map(
              (char, index) => {

                let className = "";

                if (index < input.length) {
                  className =
                    input[index] === char
                      ? "correct"
                      : "incorrect";
                }

                if (
                  index === input.length &&
                  !finished &&
                  started
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
              }
            )}

          </div>

          {/* INPUT */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            placeholder={
              finished
                ? "Test finished — click Restart."
                : countdown !== null
                  ? "Get ready..."
                  : !started
                    ? "Click Start Test..."
                    : "Start typing here..."
            }
            spellCheck="false"
            autoFocus
            disabled={
              finished ||
              countdown !== null ||
              !started
            }
          />

          {/* CARD FOOTER */}
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

        {/* RESULTS */}
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

        <span>
          Built with React + Vite
        </span>

      </footer>

    </main>
  );
}

export default App;