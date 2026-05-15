function openInvitation() {
    const cover = document.getElementById('cover');
    const splash = document.getElementById('splash');
    const mainContent = document.getElementById('mainContent');
    
    cover.style.display = 'none';
    splash.style.display = 'none';
    mainContent.style.display = 'block';
    
    setTimeout(() => {
        mainContent.style.opacity = '1';
        initAnimations();
        initCountdown();
    }, 100);
}

window.onload = function() {
    setTimeout(() => {
        document.getElementById('splash').classList.add('hidden');
    }, 2000);
};

function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title').forEach(el => {
        observer.observe(el);
    });
}

function initCountdown() {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 1);
    targetDate.setDate(30);
    targetDate.setHours(8, 0, 0, 0);

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance < 0) {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

document.getElementById('rsvpForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('nama').value;
    const kehadiran = document.getElementById('kehadiran').value;
    const jumlah = document.getElementById('jumlah').value;
    const pesan = document.getElementById('pesan').value;

    const message = `📝 RSVP Undangan %0A%0A👤 Nama: ${nama}%0A✅ Kehadiran: ${kehadiran === 'hadir' ? 'Hadir' : 'Tidak Hadir'}%0A👥 Jumlah Tamu: ${jumlah}%0A💬 Pesan: ${ pesan || 'Tidak ada' }`;

    const waNumber = '628xxxxxxxxxx';
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;
    
    window.open(waUrl, '_blank');
    
    this.reset();
    
    alert('Terima kasih! Konfirmasi telah dikirim via WhatsApp.');
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        hero.style.opacity = 1 - (scrolled / 500);
    }
});