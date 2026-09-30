/* part1: typewriter introduction */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const intro = document.getElementById("intro");
  const typed = document.getElementById("typed");
  const keysElement = document.getElementById("keys");
  /* build keyboard */
  const keyboardRows = [10, 9, 8];
  keyboardRows.forEach(function (numberofKeys) {
    const row = document.createElement("div");
    row.className = "row";
    for (let i = 0; i < numberofKeys; i++) {
      const key = document.createElement("i");
      key.className = "key";
      row.appendChild(key);
    }
    keysElement.appendChild(row);
  });
  const keys = [...keysElement.querySelectorAll(".key")];
  let finished = false;

  /* finish intro */
  function finish() {
    if (finished) return;
    finished = true;
    intro.classList.add("done");
    document.body.classList.remove("intro-on");
    document.body.classList.add("revealed");
    setTimeout(function () {
      intro.remove();
    }, 1300);
    openFromHash();

    openFromHash();
  }

  /* run typewriter effect */
  async function runIntro() {
    const lines = [
      "loading portfolio ....",
      "please stay tuned ....",
      "cutting the photostrip ....",
      "ready!",
    ];

    //blinking cursor
    const caret = document.createElement("span");
    caret.className = "caret";

    //go thru each sentence
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (finished) return;

      const paragraph = document.createElement("p");

      if (lineIndex === 0) {
        paragraph.className = "first";
      }

      typed.appendChild(paragraph);
      paragraph.appendChild(caret);

      for (const character of lines[lineIndex]) {
        if (finished) return;
        caret.before(character);

        const randomKeyNumber = Math.floor(Math.random() * keys.length);
        const randomKey = keys[randomKeyNumber];

        randomKey.classList.add("down");

        setTimeout(function () {
          randomKey.classList.remove("down");
        }, 80);

        // Wait before typing next character
        if (character === ".") {
          await wait(80);
        } else {
          await wait(25 + Math.random() * 25);
        }
      }

      // Pause between lines
      await wait(200);
    }

    // Pause before leaving intro
    await wait(250);

    finish();
  }

  // Skip intro with Escape or Enter
  window.addEventListener("keydown", function (event) {
    if (!finished && (event.key === "Escape" || event.key === "Enter")) {
      finish();
    }
  });

  // If user prefers reduced motion or has already seen the intro, skip the intro
  let seen = false;
  try {
    seen = sessionStorage.getItem("introSeen") === "yes";
  } catch (e) {}

  if (reduce || seen) {
    intro.remove();
    finished = true;
    document.body.classList.remove("intro-on");
  } else {
    runIntro();
  }

  /* viewer section */
  const viewer = document.getElementById("viewer");

  const page = viewer.querySelector(".page");

  const pageTitle = document.getElementById("page-title");

  const panels = [...viewer.querySelectorAll(".panel")];

  const frames = [...document.querySelectorAll(".frame")];

  // Current open section
  let currentPanel = -1;

  // Remember which photo opened the viewer
  let opener = null;

  // Used for heading typing animation
  let headingTimer = null;

  /* Type section heading */

  function typeHeading(heading) {
    clearInterval(headingTimer);

    const text = heading.dataset.type;

    // If animations are reduced, show full text immediately
    if (reduce) {
      heading.textContent = text;
      return;
    }

    heading.textContent = "";

    let characterIndex = 0;

    headingTimer = setInterval(function () {
      characterIndex++;

      heading.textContent = text.slice(0, characterIndex);

      // Stop when finished typing
      if (characterIndex >= text.length) {
        clearInterval(headingTimer);
      }
    }, 55);
  }

  /*  open section*/

  function openPanel(panelIndex, clickedFrame) {
    // Keep index inside valid range
    panelIndex = (panelIndex + panels.length) % panels.length;

    // Hide every panel except the selected one
    panels.forEach(function (panel, index) {
      panel.hidden = index !== panelIndex;
    });

    pageTitle.textContent = panels[panelIndex].dataset.title;

    const heading = panels[panelIndex].querySelector("h2");

    typeHeading(heading);

    // If viewer is currently closed, open it
    if (viewer.hidden) {
      opener = clickedFrame || frames[panelIndex];

      viewer.hidden = false;

      document.body.style.overflow = "hidden";
    }

    // Scroll viewer back to top
    page.scrollTop = 0;

    page.focus();

    // Remember current section
    currentPanel = panelIndex;

    // Change URL
    history.replaceState(null, "", "#" + panels[panelIndex].id);
  }

  /* =====================================================
   CLOSE VIEWER
   ===================================================== */

  function closeViewer() {
    viewer.hidden = true;

    document.body.style.overflow = "";

    currentPanel = -1;

    // Remove #about, #resume, etc. from URL
    history.replaceState(null, "", location.pathname + location.search);

    // Return keyboard focus to the photo that opened it
    if (opener) {
      opener.focus();
    }
  }

  /*
OPEN SECTION FROM URL */

  function openFromHash() {
    const panelIndex = panels.findIndex(function (panel) {
      return "#" + panel.id === location.hash;
    });

    if (panelIndex > -1) {
      openPanel(panelIndex);
    }
  }

  /* =====================================================
   PHOTO BUTTONS
   ===================================================== */

  frames.forEach(function (frame, index) {
    frame.addEventListener("click", function () {
      openPanel(index, frame);
    });
  });

  /* =====================================================
   CLOSE BUTTON
   ===================================================== */

  document.getElementById("close").addEventListener("click", closeViewer);

  /* =====================================================
   PREVIOUS BUTTON
   ===================================================== */

  document.getElementById("prev").addEventListener("click", function () {
    openPanel(currentPanel - 1);
  });

  /* =====================================================
   NEXT BUTTON
   ===================================================== */

  document.getElementById("next").addEventListener("click", function () {
    openPanel(currentPanel + 1);
  });

  /* =====================================================
   CLICK OUTSIDE PAPER TO CLOSE
   ===================================================== */

  viewer.addEventListener("click", function (event) {
    if (event.target === viewer) {
      closeViewer();
    }
  });

  /* =====================================================
   KEYBOARD CONTROLS
   ===================================================== */

  window.addEventListener("keydown", function (event) {
    if (viewer.hidden) {
      return;
    }

    if (event.key === "Escape") {
      closeViewer();
    }

    if (event.key === "ArrowRight") {
      openPanel(currentPanel + 1);
    }

    if (event.key === "ArrowLeft") {
      openPanel(currentPanel - 1);
    }
  });

  /* =====================================================
   OPEN HASH AFTER INTRO
   ===================================================== */

  if (finished) {
    openFromHash();
  }
})();
