// Central registry of seeddream-generated brand assets.
// Regenerate via scripts/gen_assets.sh (see docs/DESIGN.md for prompts & usage).
// 亮/暗双主题：插画统一纯白背景 + 克制配色，容器侧用 rounded-card + 轻投影，
// 暗色下由 <img> 外层容器背景（brand-50 / ink-800）保证对比，见各组件引用处。
import authForgot from "./generated/auth-forgot.jpeg";
import authLogin from "./generated/auth-login.jpeg";
import authRegister from "./generated/auth-register.jpeg";
import empty from "./generated/empty.jpeg";
import error from "./generated/error.jpeg";
import heroExperience from "./generated/hero-experience.jpeg";
import heroLanding from "./generated/hero-landing.jpeg";
import heroPrep from "./generated/hero-prep.jpeg";
import heroResume from "./generated/hero-resume.jpeg";
import heroReview from "./generated/hero-review.jpeg";
import loading from "./generated/loading.jpeg";
import mascotCheer from "./generated/mascot-cheer.jpeg";
import mascotThink from "./generated/mascot-think.jpeg";
import mascotWave from "./generated/mascot-wave.jpeg";
import mascot from "./generated/mascot.jpeg";
import success from "./generated/success.jpeg";

export const assets = {
  // 品牌吉祥物 · 四姿态/表情
  mascot, // 欢迎 / 微笑鼓励
  mascotWave, // 挥手打招呼
  mascotCheer, // 加油打气
  mascotThink, // 思考
  // 状态插画
  empty,
  loading,
  success,
  error,
  // 鉴权
  authLogin,
  authRegister,
  authForgot,
  // 栏目头图
  heroResume,
  heroPrep,
  heroReview,
  heroLanding,
  heroExperience,
};

// 吉祥物四姿态映射，便于按语义引用
export const mascotPose = {
  welcome: mascot,
  wave: mascotWave,
  cheer: mascotCheer,
  think: mascotThink,
} as const;
export type MascotPose = keyof typeof mascotPose;

// 五栏目头图映射
export const columnHero: Record<string, string> = {
  resume: heroResume,
  prep: heroPrep,
  review: heroReview,
  landing: heroLanding,
  experience: heroExperience,
};

// 鉴权三页插画映射
export const authIllustration = {
  login: authLogin,
  register: authRegister,
  forgot: authForgot,
} as const;
