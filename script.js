document.addEventListener('DOMContentLoaded', () => {
  console.log('SpiritBrew script loaded');

  // ===== Nav toggle =====
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // ===== SpiritGuide widget =====
  const launcher = document.getElementById('sg-launcher');
  const widget = document.getElementById('sg-widget');
  const closeBtn = document.getElementById('sg-close');
  const sgForm = document.getElementById('sg-form');
  const sgInput = document.getElementById('sg-input');
  const messages = document.getElementById('sg-messages');

  if (launcher && widget && closeBtn && sgForm && sgInput && messages) {
    function toggleWidget(open) {
      const shouldOpen = typeof open === 'boolean'
        ? open
        : !widget.classList.contains('open');
      if (shouldOpen) {
        widget.classList.add('open');
        sgInput.focus();
      } else {
        widget.classList.remove('open');
      }
    }

    launcher.addEventListener('click', () => toggleWidget(true));
    closeBtn.addEventListener('click', () => toggleWidget(false));

    function appendMessage(text, role) {
      const div = document.createElement('div');
      div.className = `sg-message ${role}`;
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    async function sendToBackend(userText) {
      // TODO: replace with your real FastAPI endpoint when ready
      const endpoint = 'https://your-api-here.example.com/spiritguide/chat';

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userText })
        });

        if (!res.ok) throw new Error('Bad status: ' + res.status);

        const data = await res.json();
        const reply = data.reply || data.answer || 'SpiritGuide is thinking in the background…';
        appendMessage(reply, 'bot');
      } catch (err) {
        appendMessage(
          "Prototype reply: your question has been logged. Once the live SpiritGuide backend is connected, I'll answer using real data from SpiritBrew and its docs.",
          'bot'
        );
        console.warn('SpiritGuide backend not reachable yet:', err);
      }
    }

    sgForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = (sgInput.value || '').trim();
      if (!text) return;
      appendMessage(text, 'user');
      sgInput.value = '';
      sendToBackend(text);
    });
  }

  // ===== Feedback Form → Google Sheets (button-based, no form submit) =====
  const fbForm = document.getElementById('feedback-form');
  const fbStatus = document.getElementById('feedback-status');
  const fbButton = document.getElementById('feedback-submit');

  if (fbForm && fbStatus && fbButton) {
    console.log('Feedback form wiring active');
    const FEEDBACK_URL = 'https://script.google.com/macros/s/AKfycbyvYzXwdmGs3xZxVUHuJLrzMZvZ3rTj9hHE7Tu-NOaPN_oTtN93lcnQ6DFxUcX2BnxlWA/exec';

    fbButton.addEventListener('click', async () => {
      fbStatus.textContent = 'Sending…';

      const payload = {
        name: document.getElementById('fb-name')?.value || '',
        email: document.getElementById('fb-email')?.value || '',
        howTried: document.getElementById('fb-how')?.value || '',
        feedback: document.getElementById('fb-feedback')?.value || '',
        permission: document.getElementById('fb-permission')?.value || '',
        pagePath: window.location.pathname,
        userAgent: navigator.userAgent
      };

      // Basic client-side guard
      if (!payload.feedback.trim()) {
        fbStatus.textContent = 'Please add some feedback before submitting.';
        return;
      }

      try {
        const res = await fetch(FEEDBACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          fbStatus.textContent = 'Thank you — your feedback has been recorded.';
          fbForm.reset();
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Feedback submit failed:', err);
        fbStatus.textContent = 'Sorry, something went wrong. Please try again later.';
      }
    });
  } else {
    console.log('Feedback form not present on this page');
  }
});
