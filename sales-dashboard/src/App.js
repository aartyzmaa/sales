Here are the updated contents for the file src/App.js, incorporating the new PointsMeter feature:

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
import PointsMeter from "./components/PointsMeter";

const AVATARS = [
  "🧑‍💼", "👩‍💼", "🧑‍💻", "👨‍💻", "👩‍💻", "🧑‍🔬", "👨‍🔬", "👩‍🔬"
];

function App() {
  const [data, setData] = useState([]);
  const [selectedName, setSelectedName] = useState("");

  useEffect(() => {
    fetch("https://sheet.best/api/sheets/6c4680e0-aa93-4fe7-ad28-f47c4b551779")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setSelectedName(data[0]?.name || "");
      })
      .catch((error) => console.error("Error fetching data:", error));
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
    return "#f44336"; // red
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

  const ProgressBar = ({ value, color = "#007bff", max = 100, showPercent = true }) => (
    <div className="progress-bar-outer">
      <motion.div
        className="progress-bar-inner"
        style={{ background: color, width: `${Math.min((value / max) * 100, 100)}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        transition={{ duration: 1 }}
      >
        {showPercent && (
          <span className="progress-label">{value.toFixed(2)}%</span>
        )}
      </motion.div>
    </div>
  );

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

  return (
    <div className="dashboard-root">
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

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">📊 Борлуулалтын уралдаан</h1>
          <div className="dashboard-dateinfo">
            <span>📅 {todayStr}</span>
            <span>🗓️ {getWorkingDaysLeft()} ажлын өдөр үлдлээ</span>
          </div>
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

        {/* Points Meter */}
        {selectedData && (
          <PointsMeter points={selectedData.Points} />
        )}

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
                  Current Rank: <strong>#{getMetricRank("CurrentAmount", "TargetAmount")}</strong>
                </div>
              </div>
              <div className="total-points-badge">
                ⭐ {selectedData.Points || "N/A"} pts
              </div>
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
            />
            <div className="metrics-section">
              <div className="info-grid">
                {/* Sales */}
                <div className="metric-block">
                  <span className="info-label">💰 Sales</span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.CurrentAmount))}₮ / {formatNumber(cleanNumber(selectedData.TargetAmount))}₮
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.CurrentAmount) / cleanNumber(selectedData.TargetAmount)) * 100)}
                  />
                  {(() => {
                    const rank = getMetricRank("CurrentAmount", "TargetAmount");
                    return (
                      <span className="metric-rank">
                        Rank #{rank} {rank === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                      </span>
                    );
                  })()}
                </div>
                {/* Coverage */}
                <div className="metric-block">
                  <span className="info-label">🏆 Coverage</span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.ercCurrent))} / {formatNumber(cleanNumber(selectedData.ercTarget))}
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.ercCurrent) / cleanNumber(selectedData.ercTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.ercCurrent) / cleanNumber(selectedData.ercTarget)) * 100)}
                  />
                  {(() => {
                    const rank = getMetricRank("ercCurrent", "ercTarget");
                    return (
                      <span className="metric-rank">
                        Rank #{rank} {rank === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                      </span>
                    );
                  })()}
                </div>
                {/* Strike Rate */}
                <div className="metric-block">
                  <span className="info-label">⚡ Strike Rate</span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.strCurrent))} / {formatNumber(cleanNumber(selectedData.strTarget))}
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.strCurrent) / cleanNumber(selectedData.strTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.strCurrent) / cleanNumber(selectedData.strTarget)) * 100)}
                  />
                  {(() => {
                    const rank = getMetricRank("strCurrent", "strTarget");
                    return (
                      <span className="metric-rank">
                        Rank #{rank} {rank === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                      </span>
                    );
                  })()}
                </div>
                {/* Audit */}
                <div className="metric-block">
                  <span className="info-label">📸 Audit (Photos)</span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.auditCurrent))} / {formatNumber(cleanNumber(selectedData.auditTarget))}
                  </span>
                  <ProgressBar
                    value={(cleanNumber(selectedData.auditCurrent) / cleanNumber(selectedData.auditTarget)) * 100}
                    color={getProgressColor((cleanNumber(selectedData.auditCurrent) / cleanNumber(selectedData.auditTarget)) * 100)}
                  />
                  {(() => {
                    const rank = getMetricRank("auditCurrent", "auditTarget");
                    return (
                      <span className="metric-rank">
                        Rank #{rank} {rank === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                      </span>
                    );
                  })()}
                </div>
                {/* New Brand Customers */}
                <div className="metric-block">
                  <span className="info-label">🆕 New Brand Customers</span>
                  <span className="info-value">
                    {formatNumber(cleanNumber(selectedData.newBrandCus))}
                  </span>
                  <ProgressBar
                    value={cleanNumber(selectedData.newBrandCus)}
                    color={getProgressColor(
                      (cleanNumber(selectedData.newBrandCus) / Math.max(...data.map(d => cleanNumber(d.newBrandCus) || 1))) * 100
                    )}
                    max={Math.max(...data.map(d => cleanNumber(d.newBrandCus) || 1))}
                    showPercent={false}
                  />
                  {(() => {
                    const rank = getValueRank("newBrandCus");
                    return (
                      <span className="metric-rank">
                        Rank #{rank} {rank === 1 && <span className="fire-emoji" role="img" aria-label="fire">🔥</span>}
                      </span>
                    );
                  })()}
                </div>
                {/* Customers Visited */}
                <div className="metric-block">
                  <span className="info-label">👥 Customers Visited (Yesterday)</span>
                  <span className="info-value">{selectedData.CustomerVisit || "N/A"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="select-prompt">Please select a sales rep to view details.</p>
        )}
      </main>
    </div>
  );
}

export default App;