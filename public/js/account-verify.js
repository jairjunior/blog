document.addEventListener('DOMContentLoaded', () => {
    // Dispara animação de confetes festivos ao carregar com sucesso
    if (typeof confetti === 'function') {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);
    }

    // Countdown de 30 segundos para redirecionamento automático
    let countdownSeconds = 30;
    const countdownNumber = document.getElementById('countdownNumber');
    countdownNumber.textContent = countdownSeconds;

    if (countdownNumber) {
        const timer = setInterval(() => {
            countdownSeconds--;
            countdownNumber.textContent = countdownSeconds;

            if (countdownSeconds <= 0) {
                clearInterval(timer);
                window.location.href = '/';
            }
        }, 1000);
    }
});