let soundEnabled = false;
let activeVideo = null;
let currentlyPlayingVideo = null;
let videoObserver = null;
let activeMedia = [];
let currentIndex = 0;
let activePostMedia = null;

function pauserPlayer(video) {
  if (!video.paused) {
    video.pause();
  } else {
    video.play().catch(() => {});
  }
}
function updateViewer() {
  const viewer = activePostMedia.querySelector(".media-viewer");
  if (!viewer) return;

  // Clean up previous media
  const existingMedia = viewer.querySelector("video, img.viewer-img");
  if (existingMedia) existingMedia.remove();

  // Also stop previous activeVideo if still around
  if (activeVideo) {
    activeVideo.pause();
    activeVideo = null;
  }

  const data = activeMedia[currentIndex];
  if (!data) return;

  if (data.type === "video") {
    const video = document.createElement("video");
    video.src = data.src;
    video.preload = "metadata";
    video.autoplay = true;
    video.controls = false;
    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "contain";
    video.style.cursor = "pointer";

    // Click inside viewer toggles pause/play
    video.addEventListener('click', () => {
      pauserPlayer(video);
    });

    viewer.insertBefore(video, viewer.firstChild);
    activeVideo = video;

    setTimeout(() => {
      video.play().catch(() => {});
    }, 100);

  } else {
    const img = document.createElement("img");
    img.src = data.src;
    img.alt = "Full screen media";
    img.className = "viewer-img";
    viewer.insertBefore(img, viewer.firstChild);
  }
}
function observeThis(post) {
  if (!videoObserver) {
    videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
          if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
            currentlyPlayingVideo.pause();
          }
          video.play().catch(() => {});
          currentlyPlayingVideo = video;
        } else {
          if (currentlyPlayingVideo === video) {
            video.pause();
            currentlyPlayingVideo = null;
          }
        }
      });
    }, {
      rootMargin: "0px 0px 200px 0px",
      threshold: 0.4
    });
  }

  const videos = post.querySelectorAll('video');
  videos.forEach(video => {
    const spinner = post.querySelector('#loaderC');

    video.addEventListener('click', () => {
      const isMulti = video.classList.contains('notOneMedia');

      if (isMulti) {
        // Multi-video: open in viewer, don't toggle play/pause in feed
        openMediaViewer(video, false);
      } else {
        // Single video: toggle play/pause normally
        if (!video.paused) {
          if (currentlyPlayingVideo && currentlyPlayingVideo !== video) {
            currentlyPlayingVideo.pause();
          }
          video.play().catch((error) => {console.error("Error playing video:", error)});
          currentlyPlayingVideo = video;
        } else {
          video.pause();
          if (currentlyPlayingVideo === video) currentlyPlayingVideo = null;
        }
      }
    });

    if (spinner) {
      video.addEventListener('waiting', () => spinner.style.display = 'flex');
      video.addEventListener('playing', () => spinner.style.display = 'none');
      video.addEventListener('canplay', () => spinner.style.display = 'none');
    }

    videoObserver.observe(video);
  });
}

function openMediaViewer(media, isOneMedia = 'hello') {
  const post = media.closest(".POST-MEDIA");
  if (!post) return;

  activePostMedia = post;

  const mediaElems = post.querySelectorAll(".fb-media img, .fb-media video");
  activeMedia = [...mediaElems].map(el => ({
    src: el.src,
    type: el.tagName.toLowerCase()
  }));

  currentIndex = Number(media.dataset.index);

  // Pause any feed video playing in this post before opening viewer
  if (currentlyPlayingVideo) {
    currentlyPlayingVideo.pause();
    currentlyPlayingVideo = null;
  }

  post.querySelector(".fb-media").classList.add("hidden");
  post.querySelector(".media-viewer").classList.remove("hidden");

  updateViewer();
}


function navigateMedia(dir) {
  currentIndex += dir;
  if (currentIndex < 0) currentIndex = activeMedia.length - 1;
  if (currentIndex >= activeMedia.length) currentIndex = 0;
  updateViewer();
}

function closeMediaViewer() {
  if (activePostMedia) {
    // Stop viewer video
    if (activeVideo) {
      activeVideo.pause();
      activeVideo = null;
    }

    activePostMedia.querySelector(".media-viewer").classList.add("hidden");
    activePostMedia.querySelector(".fb-media").classList.remove("hidden");

    // Resume whichever feed video is in view after closing
    const feedVideos = activePostMedia.querySelectorAll(".fb-media video");
    feedVideos.forEach(v => {
      const rect = v.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView && v.classList.contains('notOneMedia') === false) {
        // Only auto-resume single videos; multi videos wait for user click
        v.play().catch(() => {});
        currentlyPlayingVideo = v;
      }
    });

    activePostMedia = null;
  }
}