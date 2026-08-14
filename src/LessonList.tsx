import { useState } from "react";
import { lessons, type LessonSetup } from "./lessons";

export default function LessonList({ onApply }: { onApply: (setup: LessonSetup) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="module-list">
      {lessons.map((lesson, i) => {
        const open = i === openIndex;
        return (
          <div className={`module ${open ? "open" : ""}`} key={lesson.title}>
            <button
              aria-expanded={open}
              aria-controls={`lesson-body-${i}`}
              onClick={() => setOpenIndex(open ? null : i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{lesson.title}</b>
              <em aria-hidden="true">{open ? "−" : "+"}</em>
            </button>
            {open && (
              <div className="module-body" id={`lesson-body-${i}`}>
                <p>{lesson.body}</p>
                <p className="module-observe">{lesson.observe}</p>
                <button className="module-apply" onClick={() => onApply(lesson.setup)}>
                  {lesson.action} <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
