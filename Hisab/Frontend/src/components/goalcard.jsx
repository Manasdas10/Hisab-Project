import React, { useState, useEffect } from "react";
import { Target } from "lucide-react";

export default function GoalCard({ title, target, saved }) {
  const [value, setValue] = useState(target || "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setValue(target || "");
  }, [target]);

  function saveGoal() {
    localStorage.setItem("hisab_monthly_goal", Number(value));
    setIsEditing(false);
    window.location.reload();
  }

  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  const remaining = Math.max(0, target - saved);

  let progressColor = "green";
  if (pct >= 85) progressColor = "red";
  else if (pct >= 60) progressColor = "amber";

  return (
    <div className="goal-card-modern">
      <div className="goal-header">
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="stat-icon-wrap balance" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
            <Target size={18} />
          </div>
          <div className="goal-title-area">
            <h3>{title}</h3>
            <p>Track your target spend limit</p>
          </div>
        </div>
        <button className="goal-edit-link" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit Goal"}
        </button>
      </div>

      {isEditing ? (
        <div className="goal-input-row">
          <input
            type="number"
            placeholder="Set goal amount"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={saveGoal}>Save</button>
        </div>
      ) : (
        <>
          <div className="goal-amounts">
            <span className="goal-spent">
              ₹{saved.toLocaleString('en-IN')}
              <span className="goal-target"> / ₹{(target || 0).toLocaleString('en-IN')}</span>
            </span>
          </div>

          <div className="goal-progress-track">
            <div
              className={`goal-progress-fill ${progressColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="goal-footer">
            <span className="goal-remaining" style={{ color: pct >= 85 ? "var(--danger)" : "var(--text-secondary)" }}>
              ₹{remaining.toLocaleString('en-IN')} Remaining
            </span>
            <span className="goal-pct" style={{ color: pct >= 85 ? "var(--danger)" : "var(--accent)" }}>
              {pct}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}
