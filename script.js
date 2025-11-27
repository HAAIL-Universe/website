document.addEventListener('DOMContentLoaded', () => {
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
  const form = document.getElementById('sg-form');
  const input = document.getElementById('sg-input');
  const messages = document.getElementById('sg-messages');

  if (!launcher || !widget || !form || !input || !messages) return;

  function toggleWidget(open) {
    const shouldOpen = typeof open === 'boolean' ? open : !widget.classList.contains('open');
    if (shouldOpen) {
      widget.classList.add('open');
      input.focus();
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
      // Safe fallback while backend isn’t live yet
      appendMessage(
        "Prototype reply: your question has been logged. Once the live SpiritGuide backend is connected, I'll answer using real data from SpiritBrew and its docs.",
        'bot'
      );
      console.warn('SpiritGuide backend not reachable yet:', err);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (input.value || '').trim();
    if (!text) return;
    appendMessage(text, 'user');
    input.value = '';
    sendToBackend(text);
  });
});
