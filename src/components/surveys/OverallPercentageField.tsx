"use client";

import { useEffect, useRef, useState } from "react";

export function OverallPercentageField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [percent, setPercent] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;

    const recalculate = () => {
      const scoreableInputs = Array.from(
        form.querySelectorAll<HTMLInputElement>('input[type="radio"][data-scoreable="true"]')
      );

      const questionNames = Array.from(new Set(scoreableInputs.map((input) => input.name)));
      const totalQuestions = questionNames.length;
      const checkedInputs = questionNames
        .map((name) => form.querySelector<HTMLInputElement>(`input[type="radio"][name="${name}"]:checked`))
        .filter((input): input is HTMLInputElement => Boolean(input));

      const earnedPoints = checkedInputs.reduce((sum, input) => {
        const score = Number(input.getAttribute("data-score") || 0);
        return sum + score;
      }, 0);
      const maxPoints = totalQuestions * 5;

      setAnsweredCount(checkedInputs.length);
      setTotalCount(totalQuestions);
      setPercent(maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0);
    };

    recalculate();
    form.addEventListener("change", recalculate);
    return () => form.removeEventListener("change", recalculate);
  }, []);

  return (
    <div className="overall-percentage-field" ref={rootRef}>
      <div className="overall-percentage-head">
        <label htmlFor="overall-percentage-display">Overall Percentage</label>
        <strong>{percent.toFixed(1)}%</strong>
      </div>
      <input
        id="overall-percentage-display"
        type="text"
        readOnly
        value={`${percent.toFixed(1)}%`}
      />
      <p className="text-secondary text-sm" style={{ margin: 0 }}>
        Answered rating questions: {answeredCount}/{totalCount}
      </p>
    </div>
  );
}
