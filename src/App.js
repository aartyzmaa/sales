import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PointsMeter from "./components/PointsMeter";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";
import "./App.css";

const AVATARS = [
  "🧑‍💼", "👩‍💼", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🔬", "👨‍🔬", "👩‍🔬"
];

const QUOTES = [
  "Өнөөдөр хийсэн зүйл маргаашийн амжилтын үндэс.",
  "Хичээл зүтгэл амжилтын түлхүүр.",
  "Өөртөө итгэ, зорилгодоо хүр!",
  "Шинэ харилцагч бүр бол шинэ боломж."
];

function App() {
  const [data, setData] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [width, height] = useWindowSize();

  useEffect(() => {
    fetch("https://sheet.best/api/sheets/6c4680e0-aa93-4fe7-ad28-f47c4b551779")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setSelectedName(data[0]?.name || "");
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx((q) => (q + 1) % QUOTES.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const cleanNumber = (value) =>
    parseFloat(value?.toString().replace(/,/g, "") || 0);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-US").format(value);

  const selectedData = data.find((d) => d.name === selectedName);

  // Color for progress bar based on percent
  const getProgressColor = (percent) => {
    if (percent >= 90) return "#4caf50"; // green
    if (percent >= 60) return "#ffc107"; // yellow
    return "#ff9800"; // soft orange
  };

  // Get rank for a metric (higher percent is better)
  const getMetricRank = (metricCurrent, metricTarget) => {
    const sorted = [...data].sort((a, b) => {
      const aPercent = (cleanNumber(a[metricCurrent]) / cleanNumber(a[metricTarget])) * 100;
      const bPercent = (cleanNumber(b[metricCurrent]) / cleanNumber(b[metricTarget])) * 100;
      return bPercent - aPercent;
    });
    return sorted.findIndex((d) => d.name === selectedData.name) + 1;
  };

  // For absolute value ranking (e.g. newBrandCus)
  const getValueRank = (key) => {
    const sorted = [...data].sort((a, b) => cleanNumber(b[key]) - cleanNumber(a[key]));
    return sorted.findIndex((d) => d.name === selectedData.name) + 1;
  };

  // Badge function (Mongolian)
  const getBadge = (salesPercent, gender) => {
    if (salesPercent >= 90) {
      return gender === "Male" ? "ХААН" : "ХАТАН";
    }
    if (salesPercent >= 70) return "Тогтвортой";
    return "Илүү хичээ";
  };

  // ProgressBar with percent label and color
  const ProgressBar = ({ value, color = "#007bff", max = 100, showPercent = true }) => {
    const percent = Math.min((value / max) * 100, 100);
    return (
      <div className="progress-bar-outer">
        <motion.div
          className="progress-bar-inner"
          style={{ background: color, width: `${percent}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1 }}
        >
          {showPercent && (
            <span className="progress-label">{percent.toFixed(1)}%</span>
          )}
        </motion.div>
      </div>
    );
  };

  // Sort data for leaderboard
  const sortedData = [...data].sort((a, b) => {
    const percentA = (cleanNumber(a.CurrentAmount) / cleanNumber(a.TargetAmount)) * 100;
    const percentB = (cleanNumber(b.CurrentAmount) / cleanNumber(b.TargetAmount)) * 100;
    return percentB - percentA;
  });

  // Date and working days left
  const todayStr = new Date().toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
  function getWorkingDaysLeft() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    let count = 0;
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = today; d <= lastDay; d++) {
      const day = new Date(year, month, d).getDay();
      if (day !== 0 && day !== 6) count++;
    }
    return count;
  }

  // Helper for trend arrows (assumes *_LastWeek fields exist)
  const getTrend = (current, last) => {
    if (last === undefined) return null;
    if (current > last) return "up";
    if (current < last) return "down";
    return "equal";
  };

  // Confetti for milestones
  useEffect(() => {
    if (!selectedData) return;
    const points = Number(selectedData.Points) || 0;
    if ([500, 1000, 2000].includes(points)) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [selectedData]);

  return (
    <div className="dashboard-root">
      {showConfetti && <Confetti width={width} height={height} />}
      {/* Sidebar Leaderboard */}
      <aside className="sidebar-leaderboard">
        <h2>🏆 Шилдэг ХХА</h2>
        <div className="leaderboard-list">
          {sortedData.map((person, idx) => {
            const salesPercent = ((cleanNumber(person.CurrentAmount) / cleanNumber(person.TargetAmount)) * 100);
            const isTop = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;
            return (
              <motion.div
                key={person.name}
                className={`leaderboard-item${isTop ? " first" : isSecond ? " second" : isThird ? " third" : ""}${selectedName === person.name ? " selected" : ""}`}
                whileHover={{ scale: 1.04 }}
                onClick={() => setSelectedName(person.name)}
              >
                <span className="avatar">{AVATARS[idx % AVATARS.length]}</span>
                <span className="rank">{idx + 1}</span>
                <span className="leaderboard-name">{person.name}</span>
                <span className="leaderboard-percent">{salesPercent.toFixed(2)}%</span>
                {(isTop || isSecond || isThird) && (
                  <span className="medal">
                    {isTop ? "🥇" : (isSecond ? "🥈" : (isThird ? "🥉" : ""))}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </aside>

      {/* Mobile Leaderboard */}
      <div className="mobile-leaderboard">
        <h2>🏆 Шилдэг ХХА</h2>
        <div className="leaderboard-list">
          {sortedData.map((person, idx) => {
            const salesPercent = ((cleanNumber(person.CurrentAmount) / cleanNumber(person.TargetAmount)) * 100);
            const isTop = idx === 0;
            const isSecond = idx === 1;
            const isThird = idx === 2;
            return (
              <motion.div
                key={person.name}
                className={`leaderboard-item${isTop ? " first" : isSecond ? " second" : isThird ? " third" : ""}${selectedName === person.name ? " selected" : ""}`}
                whileHover={{ scale: 1.04 }}
                onClick={() => setSelectedName(person.name)}
              >
                <span className="avatar">{AVATARS[idx % AVATARS.length]}</span>
                <span className="rank">{idx + 1}</span>
                <span className="leaderboard-name">{person.name}</span>
                <span className="leaderboard-percent">{salesPercent.toFixed(2)}%</span>
                {(isTop || isSecond || isThird) && (
                  <span className="medal">
                    {isTop ? "🥇" : (isSecond ? "🥈" : (isThird ? "🥉" : ""))}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">📊 Борлуулалтын уралдаан</h1>
          <div className="dashboard-dateinfo">
            <span>📅 {todayStr}</span>
            <span>🗓️ {getWorkingDaysLeft()} ажлын өдөр үлдлээ</span>
          </div>
        </div>

        {/* Personalized Greeting */}
        {selectedData && (
          <div className="greeting">
            Сайн байна уу, <b>{selectedData.name}</b>!
          </div>
        )}

        {/* Motivational Quote */}
        <div className="quote-banner">
          <span>💡 {QUOTES[quoteIdx]}</span>
        </div>

        {/* Name Selection */}
        <div className="sales-rep-list">
          {data.map((person) => (
            <button
              key={person.name}
              className={`sales-rep-button${selectedName === person.name ? " active" : ""}`}
              onClick={() => setSelectedName(person.name)}
            >
              {person.name}
            </button>
          ))}
        </div>

        {/* Details Card */}
        {selectedData ? (
          <motion.div
            className="card"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="card-header">
              <span className="avatar avatar-large">
                {AVATARS[getMetricRank("CurrentAmount", "TargetAmount") % AVATARS.length]}
              </span>
              <div className="card-header-main">
                <h2>
                  {selectedData.name}{" "}
                  <span className="badge">
                    {getBadge(
                      (cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100,
                      selectedData.gender
                    )}
                  </span>
                </h2>
                <div className="rank">
                  Эрэмбэ: <strong>#{getMetricRank("CurrentAmount", "TargetAmount")}</strong>
                </div>
              </div>
              <div className="total-points-badge">
                ⭐ {selectedData.Points || "N/A"} оноо
              </div>
            </div>
            <PointsMeter points={Number(selectedData.Points) || 0} />
            <div className="points-meter-legend">
              <span>🎁 500: Бэлэг</span>
              <span>🏅 1000: Шагнал</span>
              <span>👑 2000: Тусгай шагнал</span>
            </div>
            <ProgressBar
              value={
                (cleanNumber(selectedData.CurrentAmount) /
                  cleanNumber(selectedData.TargetAmount)) *
                100
              }
              color={getProgressColor(
                (cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100
              )}
              showPercent={true}
            />
            <div className="metrics-section">
              <div className="info-grid">
                {/* Sales */}
                <div className="metric-block">
                  <span className="info-label">
                    💰 Борлуулалт
                    <span className="tooltip" data-tooltip="Нийт борлуулалтын гүйцэтгэл.">ⓘ</span>
                  </span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.CurrentAmount))}₮ / {formatNumber(cleanNumber(selectedData.TargetAmount))}₮
                    <span className="info-percent">
                      ({((cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100).toFixed(1)}%)
                      {getTrend(cleanNumber(selectedData.CurrentAmount), cleanNumber(selectedData.CurrentAmountLastWeek)) === "up" && <span className="trend-up" title="Өссөн">▲</span>}
                      {getTrend(cleanNumber(selectedData.CurrentAmount), cleanNumber(selectedData.CurrentAmountLastWeek)) === "down" && <span className="trend-down" title="Буурсан">▼</span>}
                      {getTrend(cleanNumber(selectedData.CurrentAmount), cleanNumber(selectedData.CurrentAmountLastWeek)) === "equal" && <span className="trend-equal" title="Өөрчлөлтгүй">■</span>}
                    </span>
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100)}
                    showPercent={true}
                  />
                  <span className="metric-rank">
                    Эрэмбэ #{getMetricRank("CurrentAmount", "TargetAmount")} {getMetricRank("CurrentAmount", "TargetAmount") === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                  </span>
                </div>
                {/* Coverage */}
                <div className="metric-block">
                  <span className="info-label">
                    🏆 Хамрах хүрээ
                    <span className="tooltip" data-tooltip="Зорилтот харилцагчид хүрсэн эсэх.">ⓘ</span>
                  </span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.ercCurrent))} / {formatNumber(cleanNumber(selectedData.ercTarget))}
                    <span className="info-percent">
                      ({((cleanNumber(selectedData.ercCurrent) / cleanNumber(selectedData.ercTarget)) * 100).toFixed(1)}%)
                      {getTrend(cleanNumber(selectedData.ercCurrent), cleanNumber(selectedData.ercCurrentLastWeek)) === "up" && <span className="trend-up" title="Өссөн">▲</span>}
                      {getTrend(cleanNumber(selectedData.ercCurrent), cleanNumber(selectedData.ercCurrentLastWeek)) === "down" && <span className="trend-down" title="Буурсан">▼</span>}
                      {getTrend(cleanNumber(selectedData.ercCurrent), cleanNumber(selectedData.ercCurrentLastWeek)) === "equal" && <span className="trend-equal" title="Өөрчлөлтгүй">■</span>}
                    </span>
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.ercCurrent) / cleanNumber(selectedData.ercTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.ercCurrent) / cleanNumber(selectedData.ercTarget)) * 100)}
                    showPercent={true}
                  />
                  <span className="metric-rank">
                    Эрэмбэ #{getMetricRank("ercCurrent", "ercTarget")} {getMetricRank("ercCurrent", "ercTarget") === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                  </span>
                </div>
                {/* Strike Rate */}
                <div className="metric-block">
                  <span className="info-label">
                    ⚡ Гүйцэтгэлийн хувь
                    <span className="tooltip" data-tooltip="Өдөр тутмын зорилтын биелэлт.">ⓘ</span>
                  </span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.strCurrent))} / {formatNumber(cleanNumber(selectedData.strTarget))}
                    <span className="info-percent">
                      ({((cleanNumber(selectedData.strCurrent) / cleanNumber(selectedData.strTarget)) * 100).toFixed(1)}%)
                      {getTrend(cleanNumber(selectedData.strCurrent), cleanNumber(selectedData.strCurrentLastWeek)) === "up" && <span className="trend-up" title="Өссөн">▲</span>}
                      {getTrend(cleanNumber(selectedData.strCurrent), cleanNumber(selectedData.strCurrentLastWeek)) === "down" && <span className="trend-down" title="Буурсан">▼</span>}
                      {getTrend(cleanNumber(selectedData.strCurrent), cleanNumber(selectedData.strCurrentLastWeek)) === "equal" && <span className="trend-equal" title="Өөрчлөлтгүй">■</span>}
                    </span>
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.strCurrent) / cleanNumber(selectedData.strTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.strCurrent) / cleanNumber(selectedData.strTarget)) * 100)}
                    showPercent={true}
                  />
                  <span className="metric-rank">
                    Эрэмбэ #{getMetricRank("strCurrent", "strTarget")} {getMetricRank("strCurrent", "strTarget") === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                  </span>
                </div>
                {/* Audit */}
                <div className="metric-block">
                  <span className="info-label">
                    📸 Аудит (Зураг)
                    <span className="tooltip" data-tooltip="Аудитын зураг илгээсэн байдал.">ⓘ</span>
                  </span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.auditCurrent))} / {formatNumber(cleanNumber(selectedData.auditTarget))}
                    <span className="info-percent">
                      ({((cleanNumber(selectedData.auditCurrent) / cleanNumber(selectedData.auditTarget)) * 100).toFixed(1)}%)
                      {getTrend(cleanNumber(selectedData.auditCurrent), cleanNumber(selectedData.auditCurrentLastWeek)) === "up" && <span className="trend-up" title="Өссөн">▲</span>}
                      {getTrend(cleanNumber(selectedData.auditCurrent), cleanNumber(selectedData.auditCurrentLastWeek)) === "down" && <span className="trend-down" title="Буурсан">▼</span>}
                      {getTrend(cleanNumber(selectedData.auditCurrent), cleanNumber(selectedData.auditCurrentLastWeek)) === "equal" && <span className="trend-equal" title="Өөрчлөлтгүй">■</span>}
                    </span>
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.auditCurrent) / cleanNumber(selectedData.auditTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.auditCurrent) / cleanNumber(selectedData.auditTarget)) * 100)}
                    showPercent={true}
                  />
                  <span className="metric-rank">
                    Эрэмбэ #{getMetricRank("auditCurrent", "auditTarget")} {getMetricRank("auditCurrent", "auditTarget") === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                  </span>
                </div>
                {/* New Brand Customers */}
                <div className="metric-block">
                  <span className="info-label">
                    🆕 Шинэ брэндийн харилцагч
                    <span className="tooltip" data-tooltip="Шинээр нэмсэн брэндийн харилцагчдын тоо.">ⓘ</span>
                  </span>
                  <span className="info-value">
                    {cleanNumber(selectedData.newBrandCus) === 0
                      ? <span className="motivational-text">Анхныг нь чи нээ!</span>
                      : formatNumber(cleanNumber(selectedData.newBrandCus))}
                  </span>
                  <ProgressBar
                    value={cleanNumber(selectedData.newBrandCus)}
                    color={getProgressColor(
                      (cleanNumber(selectedData.newBrandCus) / Math.max(...data.map(d => cleanNumber(d.newBrandCus) || 1))) * 100
                    )}
                    max={Math.max(...data.map(d => cleanNumber(d.newBrandCus) || 1))}
                    showPercent={false}
                  />
                  <span className="metric-rank">
                    Эрэмбэ #{getValueRank("newBrandCus")} {getValueRank("newBrandCus") === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                  </span>
                </div>
                {/* Customers Visited */}
                <div className="metric-block">
                  <span className="info-label">
                    👥 Өчигдөр очсон харилцагч
                    <span className="tooltip" data-tooltip="Өчигдөр уулзсан харилцагчдын тоо.">ⓘ</span>
                  </span>
                  <span className="info-value">{selectedData.CustomerVisit || "N/A"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="select-prompt">Харуулах ХХА-г сонгоно уу.</p>
        )}
      </main>
    </div>
  );
}

export default App;