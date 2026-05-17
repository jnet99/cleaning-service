// Custom JavaScript for the House Cleaning Company website

function toggle(header) {
  const block = header.closest('.service-block');
  const isOpen = block.classList.contains('open');

  // Close all open blocks
  document.querySelectorAll('.service-block.open').forEach(b => b.classList.remove('open'));

  // Open clicked one (unless it was already open)
  if (!isOpen) block.classList.add('open');
}

// Auto-open if URL hash matches a service
window.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target && target.classList.contains('service-block')) {
      target.classList.add('open');
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }
});
