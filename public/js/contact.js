const contactForm = document.getElementById('contactForm');
const formAlert   = document.getElementById('formAlert');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = document.getElementById('btnText');

function showAlert(message, type) {
  formAlert.className = 'show ' + type;
  formAlert.textContent = message;
  formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert() {
  formAlert.className = '';
  formAlert.textContent = '';
}

function setLoading(loading) {
  submitBtn.disabled = loading;
  if (btnText) {
    btnText.innerHTML = loading
      ? '<i class="fas fa-spinner fa-spin"></i> Sending…'
      : '<i class="fas fa-paper-plane"></i> Send Message';
  }
}

function validateField(fieldId, inputId, isEmail) {
  const field = document.getElementById(fieldId);
  const input = document.getElementById(inputId);
  if (!field || !input) return true;
  const val = input.value.trim();
  let valid = val.length > 0;
  if (isEmail) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  field.classList.toggle('invalid', !valid);
  return valid;
}

if (contactForm) {
  ['name', 'email', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      const fieldId = id + 'Field';
      validateField(fieldId, id, id === 'email');
    });
  });

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const nameOk    = validateField('nameField',    'name',    false);
    const emailOk   = validateField('emailField',   'email',   true);
    const messageOk = validateField('messageField', 'message', false);

    if (!nameOk || !emailOk || !messageOk) return;

    const name    = document.getElementById('name').value.trim();
    const email   = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const data = await response.json();

      if (data.success) {
        showAlert(data.message || "Message sent! I'll get back to you shortly.", 'success');
        contactForm.reset();
        ['nameField','emailField','messageField'].forEach(f => {
          const el = document.getElementById(f);
          if (el) el.classList.remove('invalid');
        });
      } else {
        showAlert(data.error || 'Something went wrong. Please try again.', 'error');
      }
    } catch (err) {
      showAlert('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  });
}
