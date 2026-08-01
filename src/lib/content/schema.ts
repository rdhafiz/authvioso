import {
  methodTags,
  standardTags,
  threatTags,
  type ChapterFrontmatter,
} from "@/types/content";

/**
 * Frontmatter validation.
 *
 * Hand-rolled rather than pulling in a schema library. There's exactly one
 * shape to validate, the rules are project-specific, and the error messages
 * matter more than the machinery — "reviewed must be YYYY-MM-DD" is more use
 * to whoever's writing a chapter at 11pm than a library's type union dump.
 *
 * Runs at build. A chapter that fails doesn't render.
 */

const LEVELS = ["foundation", "beginner", "intermediate", "advanced", "expert"];
const STATUSES = ["draft", "under-review", "locked", "deprecated", "retired"];

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateFrontmatter(
  input: unknown,
  slug: string,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (typeof input !== "object" || input === null) {
    return {
      valid: false,
      errors: [`${slug}: no frontmatter found`],
      warnings,
    };
  }

  const fm = input as Partial<ChapterFrontmatter>;

  const required = (field: keyof ChapterFrontmatter, label = field) => {
    if (fm[field] === undefined || fm[field] === "") {
      errors.push(`${slug}: missing ${label}`);
      return false;
    }
    return true;
  };

  required("id");
  required("title");
  required("description");
  required("objective");
  required("owner");
  required("version");

  if (required("reviewed") && !/^\d{4}-\d{2}-\d{2}$/.test(fm.reviewed ?? "")) {
    errors.push(`${slug}: reviewed must be YYYY-MM-DD`);
  }

  if (fm.level && !LEVELS.includes(fm.level)) {
    errors.push(
      `${slug}: level "${fm.level}" is not one of ${LEVELS.join(", ")}`,
    );
  }

  if (fm.status && !STATUSES.includes(fm.status)) {
    errors.push(`${slug}: status "${fm.status}" is not recognised`);
  }

  if (typeof fm.readingTime === "number" && fm.readingTime > 20) {
    // Twenty minutes is the ceiling. Past it, the chapter is doing more than
    // one thing and wants splitting.
    warnings.push(
      `${slug}: ${fm.readingTime} min is over the 20 min ceiling — consider splitting`,
    );
  }

  if (fm.objectives && fm.objectives.length > 6) {
    warnings.push(
      `${slug}: ${fm.objectives.length} objectives listed; more than six stops being read`,
    );
  }

  // Tags come from closed vocabularies. A typo'd tag silently drops the
  // chapter out of every filter that should have found it, so it's an error
  // rather than a warning.
  checkTags(fm.methods, methodTags, "methods", slug, errors);
  checkTags(fm.threats, threatTags, "threats", slug, errors);
  checkTags(fm.standards, standardTags, "standards", slug, errors);

  return { valid: errors.length === 0, errors, warnings };
}

function checkTags(
  values: readonly string[] | undefined,
  allowed: readonly string[],
  field: string,
  slug: string,
  errors: string[],
) {
  if (!values) return;
  for (const value of values) {
    if (!allowed.includes(value)) {
      errors.push(`${slug}: unknown ${field} tag "${value}"`);
    }
  }
}
