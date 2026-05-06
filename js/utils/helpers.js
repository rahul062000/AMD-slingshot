/* ============================================================
   Nutrilite — Helpers
   Date utils, formatters, sanitizers, DOM helpers
   ============================================================ */
const Helpers = (() => {
  'use strict';

  // --- XSS Prevention ---
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  function sanitizeInput(str, maxLen = 200) {
    if (typeof str !== 'string') return '';
    return str.trim().slice(0, maxLen).replace(/[<>]/g, '');
  }

  // --- Date Helpers ---
  function today() { return new Date().toISOString().split('T')[0]; }

  function formatDate(date, style = 'short') {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const opts = style === 'long'
      ? { weekday: 'long', month: 'long', day: 'numeric' }
      : style === 'medium'
      ? { month: 'short', day: 'numeric' }
      : { month: 'numeric', day: 'numeric' };
    return d.toLocaleDateString('en-US', opts);
  }

  function dayName(date) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
  }

  function getWeekDates(offsetWeeks = 0) {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + offsetWeeks * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  }

  function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  }

  function daysBetween(d1, d2) {
    return Math.floor((new Date(d2) - new Date(d1)) / 86400000);
  }

  // --- Greeting ---
  function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getMealTimeSlot() {
    const h = new Date().getHours();
    if (h < 10) return 'breakfast';
    if (h < 14) return 'lunch';
    if (h < 17) return 'snack';
    return 'dinner';
  }

  // --- Number Formatters ---
  function formatNum(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  function round1(n) { return Math.round(n * 10) / 10; }

  // --- DOM Helpers ---
  function $(sel, ctx = document) { return ctx.querySelector(sel); }
  function $$(sel, ctx = document) { return Array.from(ctx.querySelectorAll(sel)); }

  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'className') el.className = v;
      else if (k === 'textContent') el.textContent = v;
      else if (k === 'innerHTML') el.innerHTML = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => el.dataset[dk] = dv);
      else el.setAttribute(k, v);
    });
    children.forEach(c => {
      if (typeof c === 'string') el.appendChild(document.createTextNode(c));
      else if (c) el.appendChild(c);
    });
    return el;
  }

  // Safe innerHTML alternative — set via textContent where possible
  function setHTML(el, html) {
    if (el) el.innerHTML = html;
  }

  // --- Debounce ---
  function debounce(fn, ms = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  // --- UUID (for food logs) ---
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // --- Toast notifications ---
  function showToast(message, type = 'success', duration = 3000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = createElement('div', { id: 'toast-container', className: 'toast-container' });
      document.body.appendChild(container);
    }
    const toast = createElement('div', {
      className: `toast toast-${type}`,
      innerHTML: `<span>${escapeHTML(message)}</span>`
    });
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  // --- Modal helper ---
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('active'); document.body.style.overflow = 'hidden'; }
  }
  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); document.body.style.overflow = ''; }
  }

  return {
    escapeHTML, sanitizeInput, today, formatDate, dayName, getWeekDates, daysAgo,
    daysBetween, getGreeting, getMealTimeSlot, formatNum, round1,
    $, $$, createElement, setHTML, debounce, uid, showToast, openModal, closeModal
  };
})();
