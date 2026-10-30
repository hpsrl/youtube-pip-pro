const $ = (id) => document.getElementById(id);
let tabId = null;
let locked = false;
let lang = 'en';
const translations = {
  id: {
    languageLabel:'Bahasa / Language', checking:'Memeriksa video...', lock:'Kunci kontrol ekstensi', unlock:'Buka kunci kontrol ekstensi',
    pip:'Buka / Tutup PiP', playback:'Pemutaran', previous:'Video sebelumnya', back:'Mundur 10 detik', play:'Putar / Jeda', forward:'Maju 10 detik', next:'Video berikutnya', speed:'Kecepatan', normal:'1× Normal',
    footer:'Kontrol video berikutnya/sebelumnya bergantung pada ketersediaan playlist YouTube.', noVideo:'Video belum siap', playing:'Sedang diputar', paused:'Dijeda', pipOn:'PiP aktif', pipOff:'PiP tidak aktif', openYoutube:'Buka tab YouTube terlebih dahulu', openVideo:'Buka video di youtube.com', refreshHint:'Pastikan halaman YouTube sudah terbuka. Jika baru memasang ekstensi, muat ulang tab YouTube.', locked:'Kontrol ekstensi dikunci. Kontrol native browser tetap tersedia.', unlocked:'Kontrol ekstensi dibuka.', noTab:'Tab YouTube tidak ditemukan.', failed:'Perintah gagal.'
  },
  en: {
    languageLabel:'Language / Bahasa', checking:'Checking video...', lock:'Lock extension controls', unlock:'Unlock extension controls',
    pip:'Open / Close PiP', playback:'Playback', previous:'Previous video', back:'Back 10 seconds', play:'Play / Pause', forward:'Forward 10 seconds', next:'Next video', speed:'Playback speed', normal:'1× Normal',
    footer:'Next/previous controls depend on YouTube playlist availability.', noVideo:'Video is not ready', playing:'Playing', paused:'Paused', pipOn:'PiP active', pipOff:'PiP inactive', openYoutube:'Open a YouTube tab first', openVideo:'Open a video on youtube.com', refreshHint:'Make sure YouTube is open. If you just installed the extension, reload the YouTube tab.', locked:'Extension controls locked. Native browser controls remain available.', unlocked:'Extension controls unlocked.', noTab:'YouTube tab not found.', failed:'Action failed.'
  }
};
function t(key) { return translations[lang][key] || translations.en[key] || key; }
async function send(action, value) {
  if (tabId === null) throw new Error(t('noTab'));
  const result = await chrome.tabs.sendMessage(tabId, { target:'youtube-pip-pro', action, value });
  if (!result?.ok) throw new Error(result?.error || t('failed'));
  return result;
}
function showError(message = '') { $('error').textContent = message; }
function applyLanguage() {
  document.documentElement.lang = lang;
  $('languageLabel').textContent = t('languageLabel');
  $('status').textContent = t('checking');
  $('lock').title = locked ? t('unlock') : t('lock');
  $('lock').setAttribute('aria-label', $('lock').title);
  $('pip').textContent = t('pip');
  $('playbackHeading').textContent = t('playback');
  $('previous').title = $('previous').ariaLabel = t('previous');
  $('back').title = t('back'); $('play').textContent = t('play'); $('forward').title = t('forward');
  $('next').title = $('next').ariaLabel = t('next');
  $('speedHeading').textContent = t('speed'); $('speed').querySelector('option[value="1"]').textContent = t('normal');
  $('footer').textContent = t('footer');
}
function updateLockUI() {
  $('lock').textContent = locked ? '🔒' : '🔓';
  $('lock').title = locked ? t('unlock') : t('lock');
  $('lock').setAttribute('aria-label', $('lock').title);
  for (const id of ['previous','back','play','forward','next','speed']) $(id).disabled = locked;
}
async function refresh() {
  try {
    const status = await send('status');
    locked = status.locked;
    $('status').textContent = !status.hasVideo ? t('noVideo') : `${status.playing ? t('playing') : t('paused')} · ${status.pip ? t('pipOn') : t('pipOff')}`;
    if (status.hasVideo) $('speed').value = String(status.speed);
    updateLockUI(); $('pip').disabled = false;
  } catch {
    $('status').textContent = t('openYoutube'); $('pip').disabled = true;
    showError(t('refreshHint'));
  }
}
async function runAction(action, value) {
  showError('');
  try { await send(action, value); await refresh(); }
  catch (error) { showError(error.message); }
}
$('language').addEventListener('change', async () => {
  lang = $('language').value; applyLanguage(); updateLockUI(); showError('');
  try { await chrome.storage.local.set({ preferredLanguage: lang }); } catch {}
  await refresh();
});
$('lock').addEventListener('click', async () => {
  try {
    const result = await send('lock', !locked); locked = result.locked; updateLockUI();
    showError(locked ? t('locked') : t('unlocked'));
  } catch (error) { showError(error.message); }
});
$('pip').addEventListener('click', () => runAction('pip'));
$('previous').addEventListener('click', () => runAction('previous'));
$('back').addEventListener('click', () => runAction('seek', -10));
$('play').addEventListener('click', () => runAction('playPause'));
$('forward').addEventListener('click', () => runAction('seek', 10));
$('next').addEventListener('click', () => runAction('next'));
$('speed').addEventListener('change', () => runAction('speed', $('speed').value));
async function init() {
  try { const saved = await chrome.storage.local.get('preferredLanguage'); if (saved.preferredLanguage === 'en' || saved.preferredLanguage === 'id') lang = saved.preferredLanguage; } catch {}
  $('language').value = lang; applyLanguage();
  const [tab] = await chrome.tabs.query({ active:true, currentWindow:true });
  if (!tab?.id || !tab.url?.startsWith('https://www.youtube.com/')) {
    $('status').textContent = t('openVideo'); $('pip').disabled = true;
    for (const id of ['lock','previous','back','play','forward','next','speed']) $(id).disabled = true;
    return;
  }
  tabId = tab.id; await refresh();
}
init();
