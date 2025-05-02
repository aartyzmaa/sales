import React from "react";
import "./PointsMeter.css";

const MILESTONES = [
  { value: 500, label: "🎁 500" },
  { value: 1000, label: "🏅 1000" },
  { value: 2000, label: "👑 2000" }
];

export default function PointsMeter({ points = 0 }) {
  const max = MILESTONES[MILESTONES.length - 1].value;
  const percent = Math.min((points / max) * 100, 100);

  // Find next milestone
  const next = MILESTONES.find(m => points < m.value);
  const toNext = next ? next.value - points : 0;

  return (
    <div className="points-meter-root">
      <div className="points-meter-labels">
        <span>Оноо</span>
        <span className="points-meter-current">{points} оноо</span>
      </div>
      <div className="points-meter-bar-outer">
        <div className="points-meter-bar-inner" style={{ width: `${percent}%` }} />
        {MILESTONES.map((m, i) => {
          const isLast = i === MILESTONES.length - 1;
          return (
            <div
              key={m.value}
              className={`points-meter-milestone${points >= m.value ? " reached" : ""}`}
              style={
                isLast
                  ? { right: 0, left: "auto", transform: "translateY(-60%)" }
                  : { left: `${(m.value / max) * 100}%`, transform: "translate(-50%, -60%)" }
              }
            >
              <span>{m.label}</span>
            </div>
          );
        })}
      </div>
      <div className="points-meter-next">
        {next
          ? `🎯 Дараагийн шагнал хүртэл ${toNext} оноо (${next.label.replace(/^\D+/, "")} оноо)`
          : "🏆 Бүх шагналуудыг авсан!"}
      </div>
    </div>
  );
}