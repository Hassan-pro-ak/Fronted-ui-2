async function fetchVideo() {
  const url = document.getElementById("videoURL").value;
  const resultBox = document.getElementById("result");
  const videoPreview = document.getElementById("videoPreview");
  const downloadBtn = document.getElementById("downloadBtn");

  if (!url) {
    alert("❌ Please enter a valid video URL!");
    return;
  }

  try {
    const response = await fetch("https://video-downloader-production-1235.up.railway.app/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    const data = await response.json();

    if (data && data.url) {
      // Auto-download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = "video.mp4";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Preview bhi dikhao
      videoPreview.src = data.url;
      downloadBtn.href = data.url;
      resultBox.classList.remove("hidden");
    } else {
      alert("❌ Could not fetch video.");
    }

  } catch (err) {
    alert("⚠️ Error connecting to server.");
    console.error(err);
  }
}

function pasteURL() {
  navigator.clipboard.readText().then(text => {
    document.getElementById("videoURL").value = text;
  });
}
