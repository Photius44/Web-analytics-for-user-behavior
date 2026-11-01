/**
 * tracker.js - Web Analytics User Behavior Tracking Script
 * 
 * This is a lightweight, self-invoking tracking script designed to capture page views,
 * clicks, and scroll depth. Events are queued and batch-uploaded to the backend
 * to optimize network usage and avoid browser performance issues.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const BACKEND_URL = 'http://localhost:5000/api/track';
  const FLUSH_INTERVAL_MS = 5000; // Send events every 5 seconds
  const BATCH_LIMIT = 10;        // Send immediately if queue hits 10 events
  const VISITOR_ID_KEY = 'analytics_visitor_id';
  const SESSION_ID_KEY = 'analytics_session_id';

  // Get Project ID from the script tag attribute or global variable
  const scriptEl = document.currentScript || document.querySelector('script[data-project-id]');
  const projectId = scriptEl ? scriptEl.getAttribute('data-project-id') : (window.analyticsProjectId || null);

  if (!projectId) {
    console.warn('[Analytics] Missing data-project-id attribute. Events will not be tracked.');
  }

  // --- State ---
  const eventQueue = [];
  let flushTimeout = null;
  let maxPercentage = 0;
  let lastSentPercentage = 0;

  // --- Identity Management ---
  
  /**
   * Generates a standard UUIDv4.
   * Uses modern crypto API if available, falls back to math-based generation.
   */
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Get or create Visitor ID (Persists across browser sessions)
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  // Get or create Session ID (Persists only for the current browser tab session)
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = generateUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  // --- Helper Functions ---

  /**
   * Parses the user agent string to identify the browser.
   */
  function getBrowser(ua) {
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident') || ua.includes('MSIE')) return 'Internet Explorer';
    if (ua.includes('Edge') || ua.includes('Edg')) return 'Microsoft Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
  }

  /**
   * Parses the user agent string to identify the operating system.
   */
  function getOS(ua) {
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Unknown';
  }

  /**
   * Deduce the device type based on user agent keywords.
   */
  function getDeviceType(ua) {
    if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      return 'Mobile';
    }
    if (/Tablet|iPad|PlayBook|Silk/i.test(ua)) {
      return 'Tablet';
    }
    return 'Desktop';
  }

  /**
   * Throttles scroll events to prevent performance degradation.
   */
  function throttle(func, limit) {
    let inThrottle = false;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // --- Event Queue and Batching Logic ---

  /**
   * Pushes a tracking event into the queue.
   * Flushes immediately if batch limit is met.
   */
  function pushEvent(eventType, payload) {
    if (!projectId) return;

    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      payload: payload || {}
    };

    eventQueue.push(event);

    // If we reach the batch size limit, send immediately
    if (eventQueue.length >= BATCH_LIMIT) {
      flushQueue();
    } else {
      scheduleFlush();
    }
  }

  /**
   * Schedules a flush after the configured interval.
   */
  function scheduleFlush() {
    if (flushTimeout) return;
    flushTimeout = setTimeout(flushQueue, FLUSH_INTERVAL_MS);
  }

  /**
   * Checks if a new scroll depth has been reached and appends it to the queue before flushing.
   */
  function checkScrollUpdate() {
    if (maxPercentage > lastSentPercentage) {
      pushEvent('SCROLL', { maxPercentage });
      lastSentPercentage = maxPercentage;
    }
  }

  /**
   * Formats the raw events into the nested payload required by the backend.
   */
  function formatPayload(events) {
    return {
      projectId: projectId,
      visitorId: visitorId,
      sessionId: sessionId,
      events: events.map(e => ({
        eventType: e.type,
        pageUrl: e.url,
        payload: e.payload,
        createdAt: e.timestamp
      }))
    };
  }

  /**
   * Empties the queue and triggers transmission.
   */
  function flushQueue() {
    if (flushTimeout) {
      clearTimeout(flushTimeout);
      flushTimeout = null;
    }

    checkScrollUpdate();

    if (eventQueue.length === 0) return;

    // Splice all events to prevent race conditions during async operations
    const eventsToSend = eventQueue.splice(0, eventQueue.length);
    const payload = formatPayload(eventsToSend);
    sendData(payload);
  }

  /**
   * Flushes queue using navigator.sendBeacon during page exit to guarantee transmission.
   */
  function flushQueueBeacon() {
    checkScrollUpdate();

    if (eventQueue.length === 0) return;

    const eventsToSend = eventQueue.splice(0, eventQueue.length);
    const payload = formatPayload(eventsToSend);
    const payloadStr = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payloadStr], { type: 'application/json' });
      navigator.sendBeacon(BACKEND_URL, blob);
    } else {
      sendData(payload);
    }
  }

  /**
   * Transmits event data via fetch API (with keepalive) or fallback XHR.
   */
  function sendData(payload) {
    const payloadStr = JSON.stringify(payload);

    if (typeof fetch === 'function') {
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payloadStr,
        keepalive: true // Allows the request to outlive the page session
      }).catch((err) => {
        console.error('[Analytics] Failed to send tracking data:', err);
      });
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', BACKEND_URL, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(payloadStr);
    }
  }

  // --- Interaction Tracking ---

  // 1. PAGE_VIEW Event
  const initializePageView = () => {
    const ua = navigator.userAgent;
    pushEvent('PAGE_VIEW', {
      referrer: document.referrer || '',
      browser: getBrowser(ua),
      os: getOS(ua),
      deviceType: getDeviceType(ua)
    });
  };

  // 2. CLICK Event
  const initializeClickTracking = () => {
    document.body.addEventListener('click', function (event) {
      const target = event.target;
      
      // Look for the clicked element or its closest parent representing a button or link
      const interactiveEl = target.closest('button, a, input[type="submit"]') || target;
      
      // Limit text content size to prevent bloated payloads
      const text = (interactiveEl.textContent || interactiveEl.value || '').trim().substring(0, 100);

      pushEvent('CLICK', {
        x: event.clientX + window.scrollX,
        y: event.clientY + window.scrollY,
        tagName: interactiveEl.tagName,
        text: text,
        id: interactiveEl.id || '',
        classList: Array.from(interactiveEl.classList) || []
      });
    });
  };

  // 3. SCROLL Event (Maximum Scroll Depth)
  const initializeScrollTracking = () => {
    const trackScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) return;

      const percentage = Math.min(Math.round((scrollTop / totalScrollable) * 100), 100);
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
      }
    };

    // Throttle scroll checks to every 250ms for performance stability
    window.addEventListener('scroll', throttle(trackScroll, 250));
  };

  // --- Event Listeners for Page Exit ---
  
  // Triggers when page becomes hidden or closed (ideal for modern mobile/desktop browsers)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      flushQueueBeacon();
    }
  });

  // Fallback for page closing
  window.addEventListener('beforeunload', function () {
    flushQueueBeacon();
  });

  // --- Initialization ---
  
  // Ensure the DOM is ready for click tracking binding
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePageView();
      initializeClickTracking();
      initializeScrollTracking();
    });
  } else {
    initializePageView();
    initializeClickTracking();
    initializeScrollTracking();
  }

})();
