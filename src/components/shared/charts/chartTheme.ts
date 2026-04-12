import { graphic } from 'echarts/core';

export interface ChartThemeTokens {
  isDark: boolean;
  primary: string;
  primaryHover: string;
  success: string;
  danger: string;
  warning: string;
  text: string;
  textMuted: string;
  border: string;
  card: string;
  background: string;
  muted: string;
  series: string[];
  tooltipBackground: string;
  tooltipBorder: string;
}

function readCssVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  const value = window.getComputedStyle(window.document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function withAlpha(color: string, alpha: number) {
  if (!color.startsWith('#')) return color;

  const normalized = color.length === 4
    ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
    : color;

  const hex = normalized.slice(1);
  const bigint = Number.parseInt(hex, 16);

  if (Number.isNaN(bigint)) return color;

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getChartThemeTokens(): ChartThemeTokens {
  const isDark = typeof window !== 'undefined' && window.document.documentElement.classList.contains('dark');
  const primary = readCssVar('--color-primary', '#0ea5e9');
  const primaryHover = readCssVar('--color-primary-hover', '#0284c7');
  const success = readCssVar('--color-success', '#22c55e');
  const danger = readCssVar('--color-danger', '#ef4444');
  const warning = '#f59e0b';
  const text = readCssVar('--foreground', isDark ? '#f8fafc' : '#334155');
  const textMuted = readCssVar('--muted-foreground', isDark ? '#94a3b8' : '#64748b');
  const border = readCssVar('--border', isDark ? '#334155' : '#e2e8f0');
  const card = readCssVar('--card', isDark ? '#1e293b' : '#ffffff');
  const background = readCssVar('--background', isDark ? '#0f172a' : '#f8fafc');
  const muted = readCssVar('--muted', isDark ? '#334155' : '#f1f5f9');

  return {
    isDark,
    primary,
    primaryHover,
    success,
    danger,
    warning,
    text,
    textMuted,
    border,
    card,
    background,
    muted,
    series: [primary, success, warning, '#6366f1', danger],
    tooltipBackground: isDark ? '#0f172a' : '#ffffff',
    tooltipBorder: border,
  };
}

export function buildAreaGradient(color: string) {
  return new graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: withAlpha(color, 0.28) },
    { offset: 1, color: withAlpha(color, 0.02) },
  ]);
}
