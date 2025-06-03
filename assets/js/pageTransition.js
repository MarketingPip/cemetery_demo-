document.addEventListener('click', function (event) {
  const anchor = event.target.closest('a');
  if (!anchor) return;

  const href = anchor.getAttribute('href');

  // Skip if href is missing or not a valid URL
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

  // Create a full URL from the href (handles relative URLs safely)
  let url;
  try {
    url = new URL(href, location.href);
  } catch {
    return; // malformed URL
  }

  // Only transition if same origin and path is different
  const isSameOrigin = url.origin === location.origin;
  const isSamePath = url.pathname === location.pathname;

  if (isSameOrigin && !isSamePath) {
    event.preventDefault();
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.href = url.href;
      });
    } else {
      window.location.href = url.href;
    }
  }
}); 
