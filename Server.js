<script>
  const form = document.getElementById('uploadForm');
  const fileList = document.getElementById('fileList');
  const warningMsg = document.getElementById('warningMsg');
  const MAX_FILES_GUEST = 15;

  // Initial file load
  window.addEventListener('DOMContentLoaded', loadFiles);

  // Upload handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const guestUploads = parseInt(localStorage.getItem('guestUploads') || '0');
    if (guestUploads >= MAX_FILES_GUEST) {
      warningMsg.textContent = '🚫 Guest upload limit reached (15 files). Please log in.';
      return;
    }

    const formData = new FormData(form);
    try {
      const res = await fetch('/upload', { method: 'POST', body: formData });
      const text = await res.text();
      alert(text);

      // Update local count and reset UI
      localStorage.setItem('guestUploads', guestUploads + 1);
      warningMsg.textContent = '';
      form.reset();
      loadFiles();
    } catch (err) {
      console.error(err);
      alert('❌ Upload failed. Try again.');
    }
  });

  // Load uploaded files
  async function loadFiles() {
    try {
      const res = await fetch('/files');
      const files = await res.json();
      if (!Array.isArray(files)) throw new Error('Invalid file list');

      fileList.innerHTML = '<h2>Uploaded Files:</h2>' + files.map(f => `
        <div class="file-item">
          <div class="file-link">
            <strong>${f}</strong><br>
            <a href="/uploads/${f}" target="_blank">Download</a> |
            <a href="#" onclick="copyLink(event, '${f}')">Copy Link</a>
          </div>
          <button class="button" style="padding: 5px 10px; font-size: 0.8rem;" onclick="deleteFile('${f}')">Delete</button>
        </div>
      `).join('');
    } catch (err) {
      console.error(err);
      fileList.innerHTML = '<p>⚠️ Failed to load files. Try refreshing.</p>';
    }
  }

  // File deletion
  async function deleteFile(filename) {
    if (!confirm(`Delete ${filename}?`)) return;
    try {
      const res = await fetch('/delete/' + filename, { method: 'DELETE' });
      const text = await res.text();
      alert(text);
      loadFiles();
    } catch (err) {
      alert('❌ Failed to delete.');
    }
  }

  // Copy full link
  function copyLink(e, filename) {
    e.preventDefault();
    const fullURL = `${window.location.origin}/uploads/${filename}`;
    navigator.clipboard.writeText(fullURL).then(() => {
      alert('🔗 Link copied to clipboard:\n' + fullURL);
    }).catch(() => {
      alert('❌ Failed to copy link.');
    });
  }
</script>
