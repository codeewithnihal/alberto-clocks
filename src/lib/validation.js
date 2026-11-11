/**
 * Contact-form validation. Pure functions: no React, easy to test and to reuse on a server.
 * Every function returns an error message, or "" when the value is fine.
 */
export const LIMITS = {
  name: { min: 2, max: 60 },
  company: { min: 2, max: 80 },
  email: { max: 254 },
  subject: { min: 3, max: 100 },
  message: { min: 10, max: 1000 },
};

// Name: letters and spaces only, supporting non-English letters. Rejects numbers and special characters.
const NAME_PATTERN = /^[\p{L}\p{M}]+(?:[\s]+[\p{L}\p{M}]+)*$/u;

// Company: letters, numbers, spaces, and & only. Rejects special symbols and punctuation.
const COMPANY_PATTERN = /^[\p{L}\p{N}&]+(?:[\s]+[\p{L}\p{N}&]+)*$/u;

// Subject: words, numbers, and spaces only. Rejects special characters and punctuation.
const SUBJECT_PATTERN = /^[\p{L}\p{N}\p{M}]+(?:[\s]+[\p{L}\p{N}\p{M}]+)*$/u;

/**
 * Validates email address:
 * - First character must be a letter.
 * - Allows valid email characters and digits after that.
 * - Requires '@', a valid domain, and a valid top-level domain of at least 2 characters.
 */
export function isValidEmail(raw) {
  if (!raw) return false;
  const value = raw.trim();
  if (value.length > LIMITS.email.max) return false;

  // First character must be a letter
  if (!/^[A-Za-z]/.test(value)) return false;

  const at = value.lastIndexOf("@");
  if (at < 1 || at !== value.indexOf("@")) return false;

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);

  if (local.length > 64) return false;
  // Local part allows valid characters and dots, but cannot start/end with dot or have consecutive dots
  if (!/^[A-Za-z][A-Za-z0-9!#$%&'*+/=?^_`{|}~-]*(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(local)) {
    return false;
  }

  const labels = domain.split(".");
  return (
    labels.length >= 2 &&
    labels.every((l) => /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(l)) &&
    /^[A-Za-z]{2,}$/.test(labels[labels.length - 1])
  );
}

export const validators = {
  name(raw) {
    const value = raw.trim();
    if (!value) return "Please enter your name.";
    if (value.length < LIMITS.name.min)
      return `Your name must be at least ${LIMITS.name.min} characters.`;
    if (value.length > LIMITS.name.max)
      return `Your name must be ${LIMITS.name.max} characters or fewer.`;
    if (!NAME_PATTERN.test(value))
      return "Use letters and spaces only. Numbers and special characters are not allowed.";
    return "";
  },
  company(raw) {
    const value = raw.trim();
    if (!value) return ""; // optional
    if (value.length < LIMITS.company.min)
      return `The company name must be at least ${LIMITS.company.min} characters.`;
    if (value.length > LIMITS.company.max)
      return `The company name must be ${LIMITS.company.max} characters or fewer.`;
    if (!COMPANY_PATTERN.test(value))
      return "Use letters, numbers, spaces, and & only.";
    return "";
  },
  email(raw) {
    const value = raw.trim();
    if (!value) return "Please enter your email address.";
    if (!isValidEmail(value))
      return "Email must begin with a letter and contain a valid domain (e.g. name@example.com).";
    return "";
  },
  subject(raw) {
    const value = raw.trim();
    if (!value) return "Please enter a subject.";
    if (value.length < LIMITS.subject.min)
      return `The subject must be at least ${LIMITS.subject.min} characters.`;
    if (value.length > LIMITS.subject.max)
      return `The subject must be ${LIMITS.subject.max} characters or fewer.`;
    if (!SUBJECT_PATTERN.test(value))
      return "Use letters, numbers, and spaces only. Special characters are not allowed.";
    return "";
  },
  message(raw) {
    const value = raw.trim();
    if (!value) return "Please write a message.";
    if (value.length < LIMITS.message.min)
      return `Your message must be at least ${LIMITS.message.min} characters (currently ${value.length}).`;
    if (value.length > LIMITS.message.max)
      return `Your message must be ${LIMITS.message.max} characters or fewer (currently ${value.length}).`;
    return "";
  },
};

/** validateAll({name, company, email, subject, message}) -> { field: "message" } (only fields with errors) */
export function validateAll(values) {
  const errors = {};
  for (const [field, validate] of Object.entries(validators)) {
    const message = validate(values[field] ?? "");
    if (message) errors[field] = message;
  }
  return errors;
}
