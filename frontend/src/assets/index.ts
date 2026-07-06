// Central registry of seeddream-generated brand assets.
// Regenerate via scripts/gen_assets.sh (see docs/DESIGN.md).
import authHero from "./generated/auth-hero.jpeg";
import empty from "./generated/empty.jpeg";
import error from "./generated/error.jpeg";
import heroExperience from "./generated/hero-experience.jpeg";
import heroLanding from "./generated/hero-landing.jpeg";
import heroPrep from "./generated/hero-prep.jpeg";
import heroResume from "./generated/hero-resume.jpeg";
import heroReview from "./generated/hero-review.jpeg";
import mascotWave from "./generated/mascot-wave.jpeg";
import mascot from "./generated/mascot.jpeg";
import success from "./generated/success.jpeg";

export const assets = {
  mascot,
  mascotWave,
  empty,
  success,
  error,
  authHero,
  heroResume,
  heroPrep,
  heroReview,
  heroLanding,
  heroExperience,
};

export const columnHero: Record<string, string> = {
  resume: heroResume,
  prep: heroPrep,
  review: heroReview,
  landing: heroLanding,
  experience: heroExperience,
};
