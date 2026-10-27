(function () {
  var slider = document.querySelector(".slider");
  var slides = slider.querySelectorAll(".slider__img");
  var dotsBox = document.querySelector(".slider__dots");
  var interval = Number(slider.dataset.interval) || 5000;
  var current = 0;
  var timer = null;

  var dots = Array.prototype.map.call(slides, function (_, i) {
    var dot = document.createElement("button");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Foto " + (i + 1));
    dot.addEventListener("click", function () {
      show(i);
      restart();
    });
    dotsBox.appendChild(dot);
    return dot;
  });

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach(function (el, i) {
      el.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (el, i) {
      el.setAttribute("aria-selected", i === current ? "true" : "false");
    });
  }

  function restart() {
    clearInterval(timer);
    timer = setInterval(function () {
      show(current + 1);
    }, interval);
  }

  // Pausa enquanto o mouse está em cima da foto
  slider.addEventListener("mouseenter", function () {
    clearInterval(timer);
  });
  slider.addEventListener("mouseleave", restart);

  // Arrastar para o lado no celular
  var startX = null;
  slider.addEventListener("touchstart", function (e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  slider.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      show(current + (dx < 0 ? 1 : -1));
      restart();
    }
    startX = null;
  });

  show(0);
  if (slides.length > 1) restart();
})();

(function () {
  var backdrop = document.querySelector(".backdrop");
  var layers = backdrop ? backdrop.querySelectorAll(".backdrop__img") : [];
  if (layers.length < 2) return;

  var interval = Number(backdrop.dataset.interval) || 12000;

  // Começa por um fundo aleatório e segue a sequência a partir dele
  var current = Math.floor(Math.random() * layers.length);
  layers[0].classList.remove("is-active");
  layers[current].classList.add("is-active");

  setInterval(function () {
    layers[current].classList.remove("is-active");
    current = (current + 1) % layers.length;
    layers[current].classList.add("is-active");
  }, interval);
})();

(function () {
  var box = document.querySelector(".music");
  if (!box) return;

  var toggle = box.querySelector(".music__toggle");
  var bar = box.querySelector(".music__progress span");
  var videoId = box.dataset.video;
  var player = null;
  var pausedByUser = false;

  function setPlaying(playing) {
    box.classList.toggle("is-playing", playing);
    toggle.setAttribute("aria-label", playing ? "Pausar música" : "Tocar música");
  }

  function isPlaying() {
    return player && player.getPlayerState() === YT.PlayerState.PLAYING;
  }

  toggle.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!player) return;
    if (isPlaying()) {
      pausedByUser = true;
      player.pauseVideo();
    } else {
      pausedByUser = false;
      player.playVideo();
    }
  });

  // O navegador só deixa tocar som depois que a pessoa interage com a página
  function startOnFirstInteraction() {
    function start() {
      document.removeEventListener("pointerdown", start);
      document.removeEventListener("keydown", start);
      if (player && !pausedByUser && !isPlaying()) player.playVideo();
    }
    document.addEventListener("pointerdown", start);
    document.addEventListener("keydown", start);
  }

  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("yt-player", {
      videoId: videoId,
      playerVars: { autoplay: 1, loop: 1, playlist: videoId, controls: 0, playsinline: 1 },
      events: {
        onReady: function (e) {
          e.target.setVolume(60);
          e.target.playVideo();
          setTimeout(function () {
            if (!isPlaying()) startOnFirstInteraction();
          }, 1200);
        },
        onStateChange: function (e) {
          setPlaying(e.data === YT.PlayerState.PLAYING);
        }
      }
    });

    setInterval(function () {
      if (!player || !player.getDuration) return;
      var d = player.getDuration();
      if (d) bar.style.width = (player.getCurrentTime() / d) * 100 + "%";
    }, 500);
  };

  var api = document.createElement("script");
  api.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(api);
})();

(function () {
  var poem = document.getElementById("poema");
  var open = document.querySelector('[data-open="poema"]');
  if (!poem || !open) return;

  open.addEventListener("click", function () {
    poem.showModal();
  });
  poem.querySelector(".poem__close").addEventListener("click", function () {
    poem.close();
  });
  // Fecha ao clicar fora da janela
  poem.addEventListener("click", function (e) {
    var r = poem.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right &&
      e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) poem.close();
  });
})();
