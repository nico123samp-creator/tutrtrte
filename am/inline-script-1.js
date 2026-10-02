
  // ===========================================
  // ⚙️ ENDPOINT (ubah di sini kalau perlu)
  // ===========================================
  const API_URL = 'https://anita-studio.netlify.app/.netlify/functions/amprem';

  // ===========================================
  // TOAST
  // ===========================================
  const toastEl = document.getElementById('toast');
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // ===========================================
  // API REQUEST
  // ===========================================
  async function apiRequest(action, data) {
    const payload = { action, ...data };
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  }

  // ===========================================
  // STEP 1: Kirim Magic Link
  // ===========================================
  document.getElementById('amSendMagicBtn').onclick = async function() {
    const email = document.getElementById('amEmail').value.trim();
    if (!email) { showToast('Masukkan email!'); return; }

    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner spin"></i> Mengirim...';

    const sendResult = document.getElementById('amSendResult');
    sendResult.style.display = 'block';
    sendResult.innerHTML = '<div><i class="fas fa-spinner spin"></i> Mengirim magic link...</div>';

    try {
      const data = await apiRequest('send-magiclink', { email });
      if (data.success) {
        sendResult.innerHTML = '<div style="color:#22c55e;">✅ Magic link dikirim ke <b>' + email + '</b>. Cek email Anda!</div>';
        document.getElementById('step2').style.display = 'block';
        document.getElementById('amVerifyResult').style.display = 'none';
        sendResult.dataset.email = email;
      } else {
        sendResult.innerHTML = '<div style="color:#ef4444;">' + (data.message || 'Gagal mengirim') + '</div>';
      }
    } catch (e) {
      sendResult.innerHTML = '<div style="color:#ef4444;">Error: ' + e.message + '</div>';
    }

    this.disabled = false;
    this.innerHTML = '<i class="fas fa-envelope"></i> Kirim Magic Link';
  };

  // ===========================================
  // STEP 2: Verifikasi & Aktivasi
  // ===========================================
  document.getElementById('amVerifyBtn').onclick = async function() {
    const rawLink = document.getElementById('amRawLink').value.trim();
    const email = document.getElementById('amSendResult').dataset.email
                || document.getElementById('amEmail').value.trim();

    if (!rawLink) { showToast('Tempelkan magic link!'); return; }
    if (!email) { showToast('Email tidak ditemukan, kirim ulang.'); return; }

    this.disabled = true;
    this.innerHTML = '<i class="fas fa-spinner spin"></i> Memverifikasi...';

    const verifyResult = document.getElementById('amVerifyResult');
    verifyResult.style.display = 'block';
    verifyResult.innerHTML = '<div><i class="fas fa-spinner spin"></i> Verifikasi akun...</div>';

    try {
      const verify = await apiRequest('verify-account', { email, rawLink });

      if (verify.success) {
        const idToken = verify.idToken || (verify.profile && verify.profile.idToken);
        if (!idToken) throw new Error('idToken tidak ditemukan');

        verifyResult.innerHTML = '<div style="color:#22c55e;">✅ Verifikasi berhasil! Menerapkan premium...</div>';

        const premium = await apiRequest('apply-premium', { email, idToken });

        if (premium.success) {
          // 🎉 Tampilkan success screen
          document.getElementById('step1').style.display = 'none';
          document.getElementById('step2').style.display = 'none';
          document.getElementById('successScreen').classList.add('show');
          document.getElementById('successEmail').textContent = email;
          showToast('Premium berhasil diaktifkan!');
          return;
        } else {
          verifyResult.innerHTML = '<div style="color:#ef4444;">❌ ' + (premium.message || 'Gagal apply premium') + '</div>';
        }
      } else {
        verifyResult.innerHTML = '<div style="color:#ef4444;">❌ ' + (verify.message || 'Verifikasi gagal') + '</div>';
      }
    } catch (e) {
      verifyResult.innerHTML = '<div style="color:#ef4444;">Error: ' + e.message + '</div>';
    }

    this.disabled = false;
    this.innerHTML = '<i class="fas fa-check-circle"></i> Verifikasi & Aktivasi';
  };
