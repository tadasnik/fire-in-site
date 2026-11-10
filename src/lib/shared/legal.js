/**
 * Single source of truth for the public licence, trademark and copyright
 * notices. The /terms page, the site footer, the About page and the
 * first-visit disclaimer all read from here so the wording cannot drift.
 *
 * TEMPORARY WORDING — the UK trademark application is pending. On
 * registration the following all change together, and only here:
 *   - MARK_SYMBOL        "™" -> "®"
 *   - MARK_STATUS        "the subject of a trade mark application" -> registered
 *   - add the UKIPO registration number if the review wants it shown
 * Using ® before the UKIPO grants registration is an offence under section 95
 * of the Trade Marks Act 1994, so leave this as ™ until registration is
 * confirmed in writing.
 *
 * SCOPE — the statement restricts FireInSite as a system (the application, its
 * source code, and the integration and calibration of the models within it).
 * It deliberately does NOT restrict the underlying fuel moisture data, fuel
 * models or fire behaviour equations, which are already published under their
 * own terms. Keep that distinction when editing: claiming the published
 * science would be both inaccurate and unenforceable.
 */

/** TODO(legal): flip to "®" only once UKIPO registration is granted. */
export const MARK_SYMBOL = "™";

/** TODO(legal): replace with registered wording on grant. */
export const MARK_STATUS =
  "The FireInSite name and brand identity are the subject of a trade mark application.";

/**
 * TODO(legal): confirm the copyright holder with research contracts / IP.
 * "the FireInSite project team" is not a legal entity and cannot grant or
 * refuse permissions; a named institution is needed before publishing.
 */
export const COPYRIGHT_HOLDER = "FireInSite project team";

export const COPYRIGHT_YEAR = "2026";

/** Shown on /terms so readers can see how current the statement is. */
export const STATEMENT_REVIEWED = "November 2026";

export const TERMS_HREF = "/terms";

/** e.g. "FireInSite™" — use wherever the mark appears in prose. */
export const MARKED_NAME = `FireInSite${MARK_SYMBOL}`;

/** e.g. "© 2026 FireInSite project team" */
export const COPYRIGHT_LINE = `© ${COPYRIGHT_YEAR} ${COPYRIGHT_HOLDER}`;

/**
 * One-line summary for the footer and the disclaimer modal. Keep it short:
 * the full statement lives on /terms.
 */
export const SHORT_NOTICE =
  "FireInSite is not for commercial use without permission.";

/**
 * The collaboration invitation. No address is published by choice.
 * TODO(legal): the site offers no general contact route — the only form is the
 * flame length observation survey. Decide how a permission request should
 * actually reach you before this goes live.
 */
export const CONTACT_SENTENCE =
  "If you would like to collaborate, or to discuss a particular use, please contact us.";
