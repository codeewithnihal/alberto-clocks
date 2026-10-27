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

const NAME_PATTERN = /^\p{L}[\p{L}\p{M}\s.'’-]*$/u; // letters, spaces, . ' ’ -
const COMPANY_PATTERN = /^[\p{L}\p{N}][\p{L}\p{M}\p{N}\s&.,'’()/+-]*$/u;
const EMAIL_LOCAL = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
const EMAIL_LABEL = /^[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/;

export function isValidEmail(value) {
  if (value.length > LIMITS.email.max) return false;
  const at = value.lastIndexOf("@");
  if (at < 1 || at !== value.indexOf("@")) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length > 64 || !EMAIL_LOCAL.test(local)) return false;
  const labels = domain.split(".");
  return labels.length >= 2 && labels.every((l) => EMAIL_LABEL.test(l)) && /^[A-Za-z]{2,}$/.test(labels[labels.length - 1]);
}

export const validators = {
  name(raw) {
    const value = raw.trim();
    if (!value) return "Please enter your name.";
    if (value.length < LIMITS.name.min) return `Your name must be at least ${LIMITS.name.min} characters.`;
    if (value.length > LIMITS.name.max) return `Your name must be ${LIMITS.name.max} characters or fewer.`;
    if (!NAME_PATTERN.test(value)) return "Use letters only (spaces, apostrophes, hyphens and full stops are allowed).";
    return "";
  },
  company(raw) {
    const value = raw.trim();
    if (!value) return ""; // optional
    if (value.length < LIMITS.company.min) return `The company name must be at least ${LIMITS.company.min} characters.`;
    if (value.length > LIMITS.company.max) return `The company name must be ${LIMITS.company.max} characters or fewer.`;
    if (!COMPANY_PATTERN.test(value)) return "The company name contains characters that are not allowed.";
    return "";
  },
  email(raw) {
    const value = raw.trim();
    if (!value) return "Please enter your email address.";
    if (!isValidEmail(value)) return "Enter a valid email address, for example name@example.com.";
    return "";
  },
  subject(raw) {
    const value = raw.trim();
    if (!value) return "Please enter a subject.";
    if (value.length < LIMITS.subject.min) return `The subject must be at least ${LIMITS.subject.min} characters.`;
    if (value.length > LIMITS.subject.max) return `The subject must be ${LIMITS.subject.max} characters or fewer.`;
    return "";
  },
  message(raw) {
    const value = raw.trim();
    if (!value) return "Please write a message.";
    if (value.length < LIMITS.message.min) return `Your message must be at least ${LIMITS.message.min} characters (it is ${value.length}).`;
    if (value.length > LIMITS.message.max) return `Your message must be ${LIMITS.message.max} characters or fewer (it is ${value.length}).`;
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
