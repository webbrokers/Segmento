// Lightweight wrapper for Telegram WebApp API
export function getTelegram() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function initTelegram() {
  const tg = getTelegram();
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand();
    const bg = tg.themeParams?.bg_color || '#0a0a0a';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
  } catch (e) {
    console.warn('TG init error', e);
  }
  return tg;
}

export function getUserSafe() {
  const tg = getTelegram();
  return tg?.initDataUnsafe?.user || null;
}

export function haptic(type = 'impact') {
  const tg = getTelegram();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(type);
  }
}
