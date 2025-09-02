// DOM Elements
const videoUrlInput = document.getElementById('videoURL');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadProgress = document.getElementById('downloadProgress');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const progressFill = document.querySelector('.progress-fill');
const resultBox = document.getElementById('result');
const downloadOptions = document.getElementById('downloadOptions');

// API Configuration
const API_URL = 'https://video-downloader-production-1235.up.railway.app/api/download';

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
});

// Main fetch video function based on user's working code
async function fetchVideo() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        alert("❌ Please enter a valid video URL!");
        return;
    }

    if (!isValidFacebookUrl(url)) {
        showError('❌ Invalid Facebook URL! Please valid Facebook video link enter karein.');
        return;
    }

    try {
        // Show loading state
        setLoadingState(true);
        hideMessages();
        showProgress();

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data && data.videos && data.videos.length > 0) {
            // Hide progress and show result box
            hideProgress();
            setLoadingState(false);
            
            // Clear previous options
            downloadOptions.innerHTML = "";
            
            // Create download options for each video quality
            data.videos.forEach((video, index) => {
                const videoOption = document.createElement('div');
                videoOption.className = 'video-option';
                
                videoOption.innerHTML = `
                    <div class="video-info">
                        <div class="video-quality">${video.quality || 'HD'} Quality</div>
                        <div class="video-size">${video.size || 'Unknown size'}</div>
                    </div>
                    <button class="download-option-btn" onclick="downloadVideo('${video.url}', '${video.quality || 'video'}')">
                        <i class="fas fa-download"></i>
                        Download
                    </button>
                `;
                
                downloadOptions.appendChild(videoOption);
            });
            
            // Show result box
            resultBox.classList.remove("hidden");
            resultBox.style.display = 'flex';
            
        } else {
            throw new Error("❌ Could not fetch video.");
        }

    } catch (err) {
        console.error('Download error:', err);
        setLoadingState(false);
        hideProgress();
        
        let errorMsg = '⚠️ Error connecting to server.';
        
        if (err.message.includes('404')) {
            errorMsg = '❌ Video nahi mila. URL check karein!';
        } else if (err.message.includes('403')) {
            errorMsg = '❌ Video private hai ya access nahi hai!';
        } else if (err.message.includes('network')) {
            errorMsg = '⚠️ Internet connection check karein!';
        }
        
        showError(errorMsg);
    }
}

// Download individual video function
function downloadVideo(videoUrl, quality) {
    try {
        // Create download link
        const link = document.createElement("a");
        link.href = videoUrl;
        link.download = `facebook_video_${quality}_${Date.now()}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showSuccess();
        
        // Clear input after successful download
        setTimeout(() => {
            clearInput();
            hideResultBox();
        }, 3000);
        
    } catch (error) {
        console.error('Download error:', error);
        showError('❌ Download mein problem hui. Please try again!');
    }
}

// Paste URL function based on user's working code
function pasteURL() {
    navigator.clipboard.readText().then(text => {
        videoUrlInput.value = text;
        videoUrlInput.focus();
        
        // Add visual feedback
        pasteBtn.style.background = 'rgba(46, 204, 113, 0.3)';
        setTimeout(() => {
            pasteBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        }, 500);
    }).catch(err => {
        console.error('Failed to read clipboard contents: ', err);
        showError('❌ Clipboard access nahi mil paya. Manually paste karein.');
    });
}

// Event listeners for buttons
downloadBtn.addEventListener('click', fetchVideo);
pasteBtn.addEventListener('click', pasteURL);

// Enter key support for input
videoUrlInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchVideo();
    }
});

// Input validation on typing
videoUrlInput.addEventListener('input', function() {
    hideMessages();
    hideResultBox();
    const url = this.value.trim();
    
    if (url && !isValidFacebookUrl(url)) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Validate Facebook URL
function isValidFacebookUrl(url) {
    const facebookRegex = /^https?:\/\/(www\.)?(facebook\.com|fb\.watch|m\.facebook\.com)/i;
    return facebookRegex.test(url);
}

// UI State Management Functions
function setLoadingState(loading) {
    if (loading) {
        downloadBtn.classList.add('loading');
        downloadBtn.disabled = true;
        videoUrlInput.disabled = true;
        pasteBtn.disabled = true;
    } else {
        downloadBtn.classList.remove('loading');
        downloadBtn.disabled = false;
        videoUrlInput.disabled = false;
        pasteBtn.disabled = false;
    }
}

function showProgress() {
    downloadProgress.style.display = 'block';
    updateProgress(0);
    
    // Simulate progress for better UX
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) {
            progress = 90;
            clearInterval(progressInterval);
        }
        updateProgress(progress);
    }, 200);
}

function hideProgress() {
    downloadProgress.style.display = 'none';
}

function updateProgress(percent) {
    progressFill.style.width = percent + '%';
}

function showSuccess() {
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 5000);
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

function hideMessages() {
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    downloadProgress.style.display = 'none';
}

function hideResultBox() {
    resultBox.classList.add('hidden');
    resultBox.style.display = 'none';
}

function clearInput() {
    videoUrlInput.value = '';
    videoUrlInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + V to focus input and paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !videoUrlInput.matches(':focus')) {
        e.preventDefault();
        videoUrlInput.focus();
        setTimeout(() => {
            pasteURL();
        }, 100);
    }
    
    // Escape to clear input and hide results
    if (e.key === 'Escape') {
        clearInput();
        hideMessages();
        hideResultBox();
        videoUrlInput.blur();
    }
});

// Add visual feedback for interactions
function addRippleEffect(element, event) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Add ripple effect to buttons
downloadBtn.addEventListener('click', function(e) {
    addRippleEffect(this, e);
});

pasteBtn.addEventListener('click', function(e) {
    addRippleEffect(this, e);
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

