(function () {
    'use strict';

    var CONFIG = {
        countdownDate: new Date(2026, 0, 30, 8, 0, 0),
        coverFadeMs: 800,
        autoScrollSpeed: 1.5,
        toastDurationMs: 3000
    };

    var firebaseConfig = {
        apiKey: "AIzaSyCBfM0WIpPnz4fCH7sPu98IpIXZGRFxgro",
        authDomain: "guest-dd0a3.firebaseapp.com",
        projectId: "guest-dd0a3",
        storageBucket: "guest-dd0a3.firebasestorage.app",
        messagingSenderId: "950417950891",
        appId: "1:950417950891:web:ead4b62a37954c1480cfee"
    };
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();

    var state = {
        autoScrollEnabled: false,
        scrollRafId: null,
        countdownInterval: null,
        musicPlaying: false
    };

    var $ = function (sel) { return document.querySelector(sel); };
    var $$ = function (sel) { return document.querySelectorAll(sel); };

    var els = {
        cover: $('#cover'),
        undangan: $('#undangan'),
        bgm: $('#bgm'),
        musicBtn: $('#musicBtn'),
        musicIcon: $('#musicIcon'),
        autoScrollBtn: $('#autoScrollBtn'),
        scrollIcon: $('#scrollIcon'),
        tabNav: $('#tabNav'),
        navToggle: $('#navToggle'),
        navWrapper: $('#navWrapper'),
        ucapanForm: $('#ucapanForm'),
        guestName: $('#guestName'),
        guestAttendance: $('#guestAttendance'),
        guestMessage: $('#guestMessage'),
        guestMessages: $('#guestMessages'),
        guestbookWrap: $('#guestbookWrap'),
        guestbookStats: $('#guestbookStats'),
        toast: $('#ucapanToast'),
        days: $('#days'),
        hours: $('#hours'),
        minutes: $('#minutes'),
        seconds: $('#seconds')
    };

    function pad(n) { return String(n).padStart(2, '0'); }

    function showToast(msg) {
        var t = els.toast;
        if (!t) return;
        t.textContent = msg;
        t.classList.remove('hidden');
        setTimeout(function () { t.classList.add('hidden'); }, CONFIG.toastDurationMs);
    }

    function bukaUndangan() {
        if (!els.cover || !els.undangan) return;
        els.cover.style.opacity = '0';
        els.cover.style.transition = 'opacity 0.8s ease';
        setTimeout(function () {
            els.cover.style.display = 'none';
            els.undangan.style.display = 'block';
            window.scrollTo(0, 0);
            mulaiCountdown();
            var audio = els.bgm;
            if (audio) {
                audio.play().catch(function () {});
                state.musicPlaying = true;
                if (els.musicIcon) els.musicIcon.className = 'fa-solid fa-circle-pause';
                if (els.musicBtn) els.musicBtn.classList.add('playing');
            }
        }, CONFIG.coverFadeMs);
    }

    function toggleMusic() {
        var audio = els.bgm;
        if (!audio) return;
        if (state.musicPlaying) {
            audio.pause();
            if (els.musicIcon) els.musicIcon.className = 'fa-solid fa-music';
            if (els.musicBtn) els.musicBtn.classList.remove('playing');
        } else {
            audio.play().catch(function () {});
            if (els.musicIcon) els.musicIcon.className = 'fa-solid fa-circle-pause';
            if (els.musicBtn) els.musicBtn.classList.add('playing');
        }
        state.musicPlaying = !state.musicPlaying;
    }

    function toggleAutoScroll() {
        state.autoScrollEnabled = !state.autoScrollEnabled;
        if (state.autoScrollEnabled) {
            if (els.scrollIcon) els.scrollIcon.className = 'fa-solid fa-pause';
            if (els.autoScrollBtn) els.autoScrollBtn.classList.add('active');
            startAutoScroll();
        } else {
            if (els.scrollIcon) els.scrollIcon.className = 'fa-solid fa-play';
            if (els.autoScrollBtn) els.autoScrollBtn.classList.remove('active');
            stopAutoScroll();
        }
    }

    function startAutoScroll() {
        function step() {
            if (!state.autoScrollEnabled) { state.scrollRafId = null; return; }
            var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (window.scrollY >= maxScroll) {
                window.scrollTo(0, 0);
            } else {
                window.scrollBy(0, CONFIG.autoScrollSpeed);
            }
            state.scrollRafId = requestAnimationFrame(step);
        }
        state.scrollRafId = requestAnimationFrame(step);
    }

    function stopAutoScroll() {
        if (state.scrollRafId) {
            cancelAnimationFrame(state.scrollRafId);
            state.scrollRafId = null;
        }
    }

    var navHideTimer = null;
    function showNav() { if (els.tabNav) els.tabNav.classList.remove('hide'); }
    function hideNav() { if (els.tabNav) els.tabNav.classList.add('hide'); }

    function resetNavTimer() {
        if (navHideTimer) clearTimeout(navHideTimer);
        navHideTimer = setTimeout(hideNav, 3000);
    }

    function scrollToSection(sectionId) {
        var section = document.getElementById(sectionId);
        if (!section) return;
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $$('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        $$('.tab-btn').forEach(function (b) {
            if (b.getAttribute('data-section') === sectionId) {
                b.classList.add('active');
            }
        });
        showNav();
        resetNavTimer();
    }

    function initReveal() {
        var els2 = $$('.reveal, .reveal-left, .reveal-right, .reveal-scale');
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        els2.forEach(function (el) { obs.observe(el); });
    }

    function mulaiCountdown() {
        var target = CONFIG.countdownDate.getTime();
        function update() {
            var now = Date.now();
            var selisih = target - now;
            if (selisih <= 0) {
                ['days', 'hours', 'minutes', 'seconds'].forEach(function (id) {
                    var el = document.getElementById(id);
                    if (el) el.textContent = '00';
                });
                if (state.countdownInterval) {
                    clearInterval(state.countdownInterval);
                    state.countdownInterval = null;
                }
                return;
            }
            var hari = Math.floor(selisih / 86400000);
            var jam = Math.floor((selisih % 86400000) / 3600000);
            var menit = Math.floor((selisih % 3600000) / 60000);
            var detik = Math.floor((selisih % 60000) / 1000);
            if (els.days) els.days.textContent = pad(hari);
            if (els.hours) els.hours.textContent = pad(jam);
            if (els.minutes) els.minutes.textContent = pad(menit);
            if (els.seconds) els.seconds.textContent = pad(detik);
        }
        update();
        state.countdownInterval = setInterval(update, 1000);
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.appendChild(document.createTextNode(str));
        return d.innerHTML;
    }

    function renderGuestbook(snapshot) {
        var el = els.guestMessages;
        var stats = els.guestbookStats;
        if (!el) return;
        var docs = snapshot.docs || [];
        var totalHadir = 0;
        if (!docs.length) {
            el.innerHTML = '<div class="guest-empty">Belum ada ucapan. Jadilah yang pertama!</div>';
            if (stats) stats.textContent = '0 pesan';
            return;
        }
        var html = '';
        docs.forEach(function (doc) {
            var msg = doc.data();
            var hadir = msg.attendance === 'hadir';
            if (hadir) totalHadir++;
            var initial = (msg.name || '?')[0].toUpperCase();
            var badgeText = hadir ? 'Hadir' : 'Tidak Hadir';
            var j = msg.jam || '--:--';
            var t = msg.tanggal || msg.date || '';
            html += '<div class="guest-card">' +
                '<div class="guest-header">' +
                    '<div class="guest-avatar">' + initial + '</div>' +
                    '<div class="guest-meta">' +
                        '<span class="guest-name">' + escapeHtml(msg.name) + '</span>' +
                        '<span class="guest-attendance ' + msg.attendance + '">' + badgeText + '</span>' +
                    '</div>' +
                '</div>' +
                '<p class="guest-text">' + escapeHtml(msg.message || '') + '</p>' +
                '<div class="guest-footer">' +
                    '<span class="guest-time">' + j + '</span>' +
                    (t ? '<span class="guest-date">' + t + '</span>' : '') +
                '</div>' +
            '</div>';
        });
        el.innerHTML = html;
        el.scrollTop = el.scrollHeight;
        if (stats) stats.textContent = docs.length + ' pesan \u00B7 ' + totalHadir + ' hadir';
    }

    function copiedFeedback(btn) {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        showToast('Nomor rekening disalin!');
        setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
        }, 2000);
    }

    function fallbackCopy(text, btn) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            copiedFeedback(btn);
        } catch (e) {
            showToast('Gagal menyalin. Salin manual: ' + text);
        }
    }

    function setupCopyRekening() {
        var btn = document.getElementById('btnCopy');
        var rek = document.getElementById('rekening');
        if (!btn || !rek) return;
        btn.addEventListener('click', function () {
            var text = rek.textContent.trim();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    copiedFeedback(btn);
                }).catch(function () { fallbackCopy(text, btn); });
            } else {
                fallbackCopy(text, btn);
            }
        });
    }

    function setupIntersectionObserver() {
        var allSections = $$('section[id]');
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.getAttribute('id');
                    var found = null;
                    $$('.tab-btn').forEach(function (btn) {
                        btn.classList.remove('active');
                        if (btn.getAttribute('data-section') === id) {
                            btn.classList.add('active');
                            found = btn;
                        }
                    });
                    if (found) {
                        var nav = els.tabNav;
                        if (nav) {
                            var btnTop = found.offsetTop;
                            var navH = nav.clientHeight;
                            var btnH = found.offsetHeight;
                            var target = btnTop - (navH / 2) + (btnH / 2);
                            target = Math.max(0, Math.min(target, nav.scrollHeight - navH));
                            nav.scrollTop = target;
                        }
                    }
                }
            });
        }, { root: null, threshold: 0.3 });
        allSections.forEach(function (s) { observer.observe(s); });
    }

    function hideVideoPlaceholder() {
        var video = document.querySelector('#galeri video');
        if (!video) return;
        video.addEventListener('loadeddata', function () {
            var pl = document.querySelector('.video-placeholder');
            if (pl) pl.style.display = 'none';
        });
        if (video.readyState >= 2) {
            var pl = document.querySelector('.video-placeholder');
            if (pl) pl.style.display = 'none';
        }
    }

    function bindEvents() {
        var btnBuka = $('.btn-buka');
        if (btnBuka) btnBuka.addEventListener('click', bukaUndangan);

        if (els.musicBtn) els.musicBtn.addEventListener('click', toggleMusic);
        if (els.autoScrollBtn) els.autoScrollBtn.addEventListener('click', toggleAutoScroll);

        if (els.tabNav) {
            els.tabNav.addEventListener('click', function (e) {
                var btn = e.target.closest('.tab-btn');
                if (!btn) return;
                var sectionId = btn.getAttribute('data-section');
                if (sectionId) scrollToSection(sectionId);
            });
            els.tabNav.addEventListener('mouseenter', function () { showNav(); resetNavTimer(); });
            els.tabNav.addEventListener('mouseleave', resetNavTimer);
        }

        if (els.navToggle) {
            els.navToggle.addEventListener('click', function () {
                var isHidden = els.tabNav && els.tabNav.classList.contains('hide');
                if (isHidden) showNav(); else hideNav();
            });
        }

        if (els.ucapanForm) {
            els.ucapanForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var name = (els.guestName ? els.guestName.value : '').trim();
                var attendance = els.guestAttendance ? els.guestAttendance.value : '';
                var message = (els.guestMessage ? els.guestMessage.value : '').trim();
                if (!name) { showToast('Silakan isi nama Anda'); return; }
                if (!attendance) { showToast('Pilih konfirmasi kehadiran'); return; }
                var now = new Date();
                var jam = pad(now.getHours()) + ':' + pad(now.getMinutes());
                var tanggal = pad(now.getDate()) + '-' + pad(now.getMonth() + 1) + '-' + now.getFullYear();
                db.collection('guestbook').add({
                    name: name, attendance: attendance, message: message,
                    jam: jam, tanggal: tanggal,
                    time: firebase.firestore.FieldValue.serverTimestamp()
                }).then(function () {
                    showToast('Terima kasih! Ucapan Anda telah terkirim.');
                    els.ucapanForm.reset();
                }).catch(function () {
                    showToast('Gagal mengirim. Coba lagi.');
                });
            });
        }

        window.addEventListener('beforeunload', function () {
            if (state.countdownInterval) clearInterval(state.countdownInterval);
            stopAutoScroll();
        });
    }

    function init() {
        bindEvents();
        setupCopyRekening();
        initReveal();
        setupIntersectionObserver();
        hideVideoPlaceholder();

        setTimeout(function () {
            if (els.tabNav) els.tabNav.classList.add('hide');
        }, 3000);

        var activeBtn = els.tabNav ? els.tabNav.querySelector('.tab-btn.active') : null;
        if (!activeBtn && els.tabNav) {
            var first = els.tabNav.querySelector('.tab-btn');
            if (first) first.classList.add('active');
        }

        db.collection('guestbook').orderBy('time', 'asc').onSnapshot(function (snapshot) {
            renderGuestbook(snapshot);
        }, function () {
            var el = els.guestMessages;
            if (el) {
                el.innerHTML = '<div class="guestbook-error">Gagal memuat pesan. <button onclick="location.reload()">Muat ulang</button></div>';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
