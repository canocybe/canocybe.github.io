let detik = 5; // waktu delay dalam detik
function mulaiCountdown() {
    const countdownEl = document.getElementById("countdown");
    const interval = setInterval(function () {
        countdownEl.textContent = detik;
        detik--;
        if (detik < 0) {
            clearInterval(interval);
            // Redirect langsung ke halaman tujuan
            window.location.href = "https://canocybe.pages.dev/";
        }
    }, 1000);
}
window.onload = mulaiCountdown;