import Link from "next/link";
import { SurveyDefinition, SurveyQuestion } from "@/lib/surveys";
import { submitSurveyAction } from "@/app/(protected)/surveys/[slug]/actions";
import { OverallPercentageField } from "@/components/surveys/OverallPercentageField";

function shouldNumberQuestion(question: SurveyQuestion) {
  return !["short_text", "long_text", "date"].includes(question.type);
}

function isFivePointNumericQuestion(question: SurveyQuestion) {
  if (question.type === "likert_agree") return true;
  if (question.type === "rating_5") return true;
  if (!question.options || question.options.length !== 5) return false;
  return question.options.join(",") === "1,2,3,4,5";
}

function getOptionScore(question: SurveyQuestion, option: string) {
  if (question.type === "likert_agree") {
    const likertScores: Record<string, number> = {
      "Strongly Agree": 5,
      Agree: 4,
      Neutral: 3,
      Disagree: 2,
      "Strongly Disagree": 1,
    };
    return likertScores[option];
  }

  if (question.type === "rating_5") {
    const numeric = Number(option);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  if (question.options?.length === 5 && question.options.join(",") === "1,2,3,4,5") {
    const numeric = Number(option);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  return undefined;
}

function renderQuestion(question: SurveyQuestion, questionNumber?: number) {
  const name = `q_${question.key}`;
  const requiredMark = question.required ? <span className="required-mark">*</span> : null;
  const labelText = questionNumber ? `${questionNumber}. ${question.label}` : question.label;

  if (question.type === "short_text") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <input id={name} name={name} type="text" required={question.required} />
      </div>
    );
  }

  if (question.type === "date") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <input id={name} name={name} type="date" required={question.required} />
      </div>
    );
  }

  if (question.type === "long_text") {
    return (
      <div className="survey-input-group survey-input-group--full" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <textarea id={name} name={name} required={question.required} />
      </div>
    );
  }

  if (question.type === "single_select") {
    return (
      <div className="survey-input-group" key={question.key}>
        <label htmlFor={name}>
          {labelText}
          {requiredMark}
        </label>
        <select id={name} name={name} required={question.required}>
          <option value="">Select an option</option>
          {question.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (question.type === "multi_select") {
    return (
      <div className="survey-input-group survey-input-group--full" key={question.key}>
        <label>
          {labelText}
          {requiredMark}
        </label>
        <div className="multi-select-options">
          {question.options?.map((option) => (
            <label key={option} className="option-chip">
              <input type="checkbox" name={name} value={option} />
              {option}
            </label>
          ))}
        </div>
      </div>
    );
  }

  const options = question.options ?? [];
  const groupClass =
    question.type === "likert_agree"
      ? "likert-options survey-rating-scale"
      : "rating-options survey-rating-scale";

  return (
    <div className="survey-input-group survey-input-group--full" key={question.key}>
      <label>
        {labelText}
        {requiredMark}
      </label>
      <div className={groupClass}>
        {options.map((option) => {
          const score = getOptionScore(question, option);
          return (
            <label key={option} className="option-pill">
              <input
                type="radio"
                name={name}
                value={option}
                required={question.required}
                data-scoreable={isFivePointNumericQuestion(question) ? "true" : undefined}
                data-score={score !== undefined ? String(score) : undefined}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function SurveyForm({ survey }: { survey: SurveyDefinition }) {
  return (
    <form className="survey-form-template" action={submitSurveyAction}>
      <input type="hidden" name="surveySlug" value={survey.slug} />
      <OverallPercentageField />

      {survey.sections.map((section, index) => (
        <section key={`${section.title}-${index}`} className="survey-block">
          <h3 className="survey-block-title">{section.title}</h3>
          {section.description ? <p className="survey-block-subtitle">{section.description}</p> : null}

          <div className={`survey-row ${index === 0 ? "survey-row--two-col" : "survey-row--single-col"}`}>
            {section.questions.map((question, questionIndex) => {
              const questionNumber = section.questions
                .slice(0, questionIndex + 1)
                .filter((q) => shouldNumberQuestion(q)).length;

              return renderQuestion(
                question,
                shouldNumberQuestion(question) ? questionNumber : undefined
              );
            })}
          </div>
        </section>
      ))}

      <div className="survey-action-row">
        <button className="button primary survey-submit-btn" type="submit">
          Submit Survey
        </button>
        <Link className="button" href="/dashboard">
          Cancel
        </Link>
      </div>
    </form>
  );
}
