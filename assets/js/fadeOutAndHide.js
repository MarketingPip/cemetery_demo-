export function fadeOutAndHide(elementId, hide = true) {
    const element = document.querySelector(elementId);

    if (element) {
        // Apply Tailwind fade-out classes
        element.classList.add('opacity-0', 'transition-opacity', 'duration-500');

        // Listen for the end of the transition
        const onTransitionEnd = () => {
            if (hide) {
                // Hide the element after the transition ends
                element.classList.add('hidden');
            }
            // Remove the event listener after the transition ends
            element.removeEventListener('transitionend', onTransitionEnd);
        };

        // Add the event listener for the transitionend event
        element.addEventListener('transitionend', onTransitionEnd);
    }
}
