import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const DPAD_UP = 12;
const DPAD_DOWN = 13;
const DPAD_LEFT = 14;
const DPAD_RIGHT = 15;
const BUTTON_A = 0;
const BUTTON_B = 1;
const BUTTON_Y = 3;
const BUTTON_LB = 4;
const BUTTON_RB = 5;

const AXIS_THRESHOLD = 0.5;
const RIGHT_STICK_DEAD_ZONE = 0.15;
const RIGHT_STICK_SPEED = 18;
const REPEAT_DELAY = 220;
const REPEAT_INTERVAL = 120;

const FOCUSABLE_SELECTOR = [
  'a[href]:not([disabled]):not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(',');

function getVisibleFocusables() {
  const dialog = document.querySelector('[role="dialog"]');
  const root = dialog || document;
  const all = Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR));
  return all.filter((el) => {
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    if (rect.top > window.innerHeight + 200 || rect.bottom < -200) return false;
    return true;
  });
}

function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function findBestCandidate(current, direction, candidates) {
  const from = getCenter(current);
  let best = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current) continue;
    const to = getCenter(el);
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    let primary = 0;
    let secondary = 0;
    let isValid = false;

    switch (direction) {
      case 'up':
        primary = -dy;
        secondary = Math.abs(dx);
        isValid = dy < -10;
        break;
      case 'down':
        primary = dy;
        secondary = Math.abs(dx);
        isValid = dy > 10;
        break;
      case 'left':
        primary = -dx;
        secondary = Math.abs(dy);
        isValid = dx < -10;
        break;
      case 'right':
        primary = dx;
        secondary = Math.abs(dy);
        isValid = dx > 10;
        break;
    }

    if (!isValid || primary <= 0) continue;

    const score = primary + secondary * 2.5;

    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  return best;
}

function scrollIntoViewIfNeeded(el) {
  const rect = el.getBoundingClientRect();
  const viewH = window.innerHeight;

  if (rect.top < 0 || rect.bottom > viewH) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const overflowX = style.overflowX;
    if (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden') {
      const parentRect = parent.getBoundingClientRect();
      if (rect.left < parentRect.left || rect.right > parentRect.right) {
        const scrollTarget =
          rect.left - parentRect.left + parent.scrollLeft - parentRect.width / 2 + rect.width / 2;
        parent.scrollTo({ left: scrollTarget, behavior: 'smooth' });
      }
      break;
    }
    parent = parent.parentElement;
  }
}

function findScrollableParent(el) {
  let parent = el;
  while (parent) {
    const style = getComputedStyle(parent);
    if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
      if (parent.scrollWidth > parent.clientWidth) return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function findVerticalScrollTarget() {
  const main = document.querySelector('main');
  if (main && main.scrollHeight > main.clientHeight) return main;
  const html = document.documentElement;
  if (html.scrollHeight > html.clientHeight) return html;
  return null;
}

function findHorizontalScrollTarget(focusedEl) {
  if (!focusedEl || focusedEl === document.body) return null;
  let parent = focusedEl.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    const ox = style.overflowX;
    if (
      (ox === 'auto' || ox === 'scroll' || ox === 'hidden') &&
      parent.scrollWidth > parent.clientWidth
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

export default function useGamepad() {
  const navigate = useNavigate();
  const animFrameRef = useRef(null);
  const prevButtons = useRef({});
  const repeatTimers = useRef({});
  const connectedRef = useRef(false);
  const activeScrollTargetRef = useRef({ v: null, h: null });

  const navigateFocus = useCallback((direction) => {
    const focused = document.activeElement;
    const allCandidates = getVisibleFocusables();

    if (!focused || focused === document.body) {
      if (allCandidates.length > 0) {
        allCandidates[0].focus({ preventScroll: true });
        scrollIntoViewIfNeeded(allCandidates[0]);
      }
      return;
    }

    const isHorizontal = direction === 'left' || direction === 'right';

    if (isHorizontal) {
      const scroller = findHorizontalScrollTarget(focused);
      if (scroller) {
        const siblingItems = allCandidates.filter((el) => scroller.contains(el));
        const best = findBestCandidate(focused, direction, siblingItems);
        if (best) {
          best.focus({ preventScroll: true });
          scrollIntoViewIfNeeded(best);
          return;
        }
      }
    }

    const best = findBestCandidate(focused, direction, allCandidates);
    if (best) {
      best.focus({ preventScroll: true });
      scrollIntoViewIfNeeded(best);
    }
  }, []);

  const handleButtonAction = useCallback(
    (buttonIndex) => {
      switch (buttonIndex) {
        case BUTTON_A: {
          const focused = document.activeElement;
          if (focused && focused.tagName !== 'INPUT') {
            focused.click();
          }
          break;
        }
        case BUTTON_B: {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            const closeBtn = dialog.querySelector(
              'button[aria-label="Fechar"], button[class*="close"]',
            );
            if (closeBtn) {
              closeBtn.click();
              break;
            }
          }
          navigate(-1);
          break;
        }
        case BUTTON_Y: {
          const searchInput = document.querySelector('input[placeholder*="Buscar"]');
          if (searchInput) {
            searchInput.focus();
            scrollIntoViewIfNeeded(searchInput);
          }
          break;
        }
        case BUTTON_LB: {
          const focused = document.activeElement;
          if (focused) {
            const scroller = findScrollableParent(focused);
            if (scroller) {
              scroller.scrollBy({ left: -scroller.clientWidth * 0.75, behavior: 'smooth' });
            }
          }
          break;
        }
        case BUTTON_RB: {
          const focused = document.activeElement;
          if (focused) {
            const scroller = findScrollableParent(focused);
            if (scroller) {
              scroller.scrollBy({ left: scroller.clientWidth * 0.75, behavior: 'smooth' });
            }
          }
          break;
        }
      }
    },
    [navigate],
  );

  const startRepeat = useCallback((key, action) => {
    if (repeatTimers.current[key]) return;

    action();

    repeatTimers.current[key] = {
      timeout: setTimeout(() => {
        repeatTimers.current[key].interval = setInterval(() => {
          action();
        }, REPEAT_INTERVAL);
      }, REPEAT_DELAY),
    };
  }, []);

  const stopRepeat = useCallback((key) => {
    const timer = repeatTimers.current[key];
    if (timer) {
      clearTimeout(timer.timeout);
      clearInterval(timer.interval);
      delete repeatTimers.current[key];
    }
  }, []);

  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let anyConnected = false;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;
      anyConnected = true;

      const buttons = gp.buttons;
      const axes = gp.axes;
      const prev = prevButtons.current[i] || {};
      const curr = {};

      for (let b = 0; b < buttons.length; b++) {
        curr[b] = buttons[b].pressed;
      }

      const axisLeft = axes[0] < -AXIS_THRESHOLD;
      const axisRight = axes[0] > AXIS_THRESHOLD;
      const axisUp = axes[1] < -AXIS_THRESHOLD;
      const axisDown = axes[1] > AXIS_THRESHOLD;

      const dpadUp = curr[DPAD_UP] || axisUp;
      const dpadDown = curr[DPAD_DOWN] || axisDown;
      const dpadLeft = curr[DPAD_LEFT] || axisLeft;
      const dpadRight = curr[DPAD_RIGHT] || axisRight;
      const prevDpadUp = prev[DPAD_UP] || prevButtons.current[`${i}_axisUp`];
      const prevDpadDown = prev[DPAD_DOWN] || prevButtons.current[`${i}_axisDown`];
      const prevDpadLeft = prev[DPAD_LEFT] || prevButtons.current[`${i}_axisLeft`];
      const prevDpadRight = prev[DPAD_RIGHT] || prevButtons.current[`${i}_axisRight`];

      if (dpadUp && !prevDpadUp) {
        startRepeat(`${i}_up`, () => navigateFocus('up'));
      } else if (!dpadUp && prevDpadUp) {
        stopRepeat(`${i}_up`);
      }

      if (dpadDown && !prevDpadDown) {
        startRepeat(`${i}_down`, () => navigateFocus('down'));
      } else if (!dpadDown && prevDpadDown) {
        stopRepeat(`${i}_down`);
      }

      if (dpadLeft && !prevDpadLeft) {
        startRepeat(`${i}_left`, () => navigateFocus('left'));
      } else if (!dpadLeft && prevDpadLeft) {
        stopRepeat(`${i}_left`);
      }

      if (dpadRight && !prevDpadRight) {
        startRepeat(`${i}_right`, () => navigateFocus('right'));
      } else if (!dpadRight && prevDpadRight) {
        stopRepeat(`${i}_right`);
      }

      if (curr[BUTTON_A] && !prev[BUTTON_A]) {
        handleButtonAction(BUTTON_A);
      }
      if (curr[BUTTON_B] && !prev[BUTTON_B]) {
        handleButtonAction(BUTTON_B);
      }
      if (curr[BUTTON_Y] && !prev[BUTTON_Y]) {
        handleButtonAction(BUTTON_Y);
      }
      if (curr[BUTTON_LB] && !prev[BUTTON_LB]) {
        handleButtonAction(BUTTON_LB);
      }
      if (curr[BUTTON_RB] && !prev[BUTTON_RB]) {
        handleButtonAction(BUTTON_RB);
      }

      const rsX = axes.length > 2 ? axes[2] : 0;
      const rsY = axes.length > 3 ? axes[3] : 0;

      if (Math.abs(rsY) > RIGHT_STICK_DEAD_ZONE) {
        if (!activeScrollTargetRef.current.v) {
          activeScrollTargetRef.current.v = findVerticalScrollTarget();
        }
        if (activeScrollTargetRef.current.v) {
          activeScrollTargetRef.current.v.scrollTop += rsY * RIGHT_STICK_SPEED;
        }
      } else {
        activeScrollTargetRef.current.v = null;
      }

      if (Math.abs(rsX) > RIGHT_STICK_DEAD_ZONE) {
        if (!activeScrollTargetRef.current.h) {
          activeScrollTargetRef.current.h = findHorizontalScrollTarget(document.activeElement);
        }
        if (activeScrollTargetRef.current.h) {
          activeScrollTargetRef.current.h.scrollLeft += rsX * RIGHT_STICK_SPEED;
        }
      } else {
        activeScrollTargetRef.current.h = null;
      }

      prevButtons.current[i] = curr;
      prevButtons.current[`${i}_axisUp`] = axisUp;
      prevButtons.current[`${i}_axisDown`] = axisDown;
      prevButtons.current[`${i}_axisLeft`] = axisLeft;
      prevButtons.current[`${i}_axisRight`] = axisRight;
    }

    connectedRef.current = anyConnected;
    animFrameRef.current = requestAnimationFrame(pollGamepad);
  }, [navigateFocus, handleButtonAction, startRepeat, stopRepeat]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(pollGamepad);

    const handlePointerMove = (e) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      const target = e.target?.closest?.(FOCUSABLE_SELECTOR);
      if (target && target !== document.activeElement) {
        target.focus({ preventScroll: true });
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      Object.keys(repeatTimers.current).forEach((key) => {
        clearTimeout(repeatTimers.current[key]?.timeout);
        clearInterval(repeatTimers.current[key]?.interval);
      });
      repeatTimers.current = {};
    };
  }, [pollGamepad]);
}
