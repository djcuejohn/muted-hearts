/* =========================================================
   CCD Reelbox — Confidential Connection
   Episode order follows the order of this list.
   Set an "episode" value if you want to override it.
   ========================================================= */

const CLIPS = [
  { id:1,  episode:1,  title:"Whispers Beyond the Call",   desc:"Whispers Beyond the Call",                                   category:"Animation", src:"videos/Colleagues1.mp4",   poster:"images/colleagues1.jpg",   length:"9:56" },
  { id:2,  episode:2,  title:"Elephants Dream",            desc:"Two characters explore a strange machine world.",            category:"Animation", src:"videos/masaherequest.mp4", poster:"images/masaherequest.jpg", length:"9:56" },
  { id:3,  episode:3,  title:"For Bigger Blazes",          desc:"A short spot about getting more out of a small screen.",     category:"Short",     src:"videos/gutomgirl.mp4",     poster:"images/gutomgirl.jpg",     length:"9:56" },
  { id:4,  episode:4,  title:"For Bigger Escapes",         desc:"Rainy day, sofa, and a much bigger picture.",                category:"Short",     src:"videos/wjv1.mp4",          poster:"images/wjv1.jpg",          length:"9:56" },
  { id:5,  episode:5,  title:"For Bigger Fun",             desc:"Fifteen seconds of very deliberate silliness.",              category:"Short",     src:"videos/wjv2.mp4",          poster:"images/wjv2.jpg",          length:"9:56" },
  { id:6,  episode:6,  title:"For Bigger Joyrides",        desc:"An action trailer squeezed into a quarter of a minute.",     category:"Short",     src:"videos/wjv3.mp4",          poster:"images/wjv3.jpg",          length:"9:56" },
  { id:7,  episode:7,  title:"Sintel",                     desc:"A girl searches for the dragon she raised.",                 category:"Animation", src:"videos/wjv4.mp4",          poster:"images/wjv4.jpg",          length:"9:56" },
  { id:8,  episode:8,  title:"Tears of Steel",             desc:"Live action and effects, shot in Amsterdam.",                category:"Film",      src:"videos/overtime1.mp4",     poster:"images/overtime1.jpg",     length:"9:56" },
  { id:9,  episode:9,  title:"Volkswagen GTI Review",      desc:"A hot hatch put through its paces.",                         category:"Clips",     src:"videos/call1.mp4",         poster:"images/call1.jpg",         length:"9:56" },
  { id:10, episode:10, title:"Subaru Outback",             desc:"Street and dirt, back to back.",                             category:"Clips",     src:"videos/sigetanaw1.mp4",    poster:"images/sigetanaw1.jpg",    length:"9:56" },
  { id:11, episode:11, title:"We Are Going On Bullrun",    desc:"Road trip footage from the rally.",                          category:"Clips",     src:"videos/chat1.mp4",         poster:"images/chat1.jpg",         length:"9:56" },
  { id:12, episode:12, title:"What Car Can You Get",       desc:"A short look at what a small budget buys.",                  category:"Clips",     src:"videos/chat2.mp4",         poster:"images/chat2.jpg",         length:"9:56" }
];

/* Season label used in the episode badge and player heading */
const SEASON = 1;

/* Seconds into the clip where the hover preview starts.
   0 plays from the very beginning. */
const PREVIEW_START = 0;

/* ---------- elements ---------- */
const grid    = document.getElementById("grid");
const filters = document.getElementById("filters");
const search  = document.getElementById("search");
const empty   = document.getElementById("empty");
const modal   = document.getElementById("modal");
const player  = document.getElementById("player");

let category = "All";
let query = "";
let visible = [];
let openIndex = -1;
let previewing = null;   // the <video> currently previewing

/* Episode number: use the given one, otherwise fall back to list order */
function epNum(clip){
  return clip.episode || (CLIPS.indexOf(clip) + 1);
}
function epLabel(clip){
  return "Episode " + epNum(clip);
}

/* ---------- render ---------- */
function visibleClips(){
  const q = query.trim().toLowerCase();
  return CLIPS.filter(c => {
    const inCat = category === "All" || c.category === category;
    const hay = (c.title + " " + c.desc + " " + epLabel(c)).toLowerCase();
    return inCat && (!q || hay.includes(q));
  });
}

function render(){
  visible = visibleClips();
  empty.hidden = visible.length > 0;

  grid.innerHTML = visible.map((c, i) => `
    <button class="card" data-index="${i}">
      <span class="thumb">
        <img src="${c.poster}" alt="" loading="lazy">
        <video src="${c.src}" muted loop playsinline preload="metadata"></video>
        <span class="ep">${epLabel(c)}</span>
        <span class="play"><span>&#9654;</span></span>
        <span class="time">${c.length}</span>
      </span>
      <span class="card-body">
        <span class="eyebrow">Season ${SEASON} &middot; ${epLabel(c)}</span>
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <span class="badge">${c.category}</span>
      </span>
    </button>`).join("");

  bindPreviews();
}

function renderFilters(){
  const cats = ["All", ...new Set(CLIPS.map(c => c.category))];
  filters.innerHTML = cats.map(c =>
    `<button data-cat="${c}" aria-pressed="${c === category}">${c}</button>`).join("");
}

/* ---------- hover preview ----------
   mouseenter / mouseleave are used instead of mouseover / mouseout because
   they do not fire again when the pointer moves onto a child element.
   With mouseover the clip restarted every time the pointer crossed the
   play icon or the duration chip. */
function bindPreviews(){
  if (window.matchMedia("(hover: none)").matches) return;   // touch devices: poster only

  grid.querySelectorAll(".card").forEach(card => {
    const v = card.querySelector("video");

    card.addEventListener("mouseenter", () => {
      stopPreview();                    // only one clip previews at a time
      previewing = v;
      card.classList.add("loading");
      v.muted = true;                   // required for autoplay
      try { v.currentTime = PREVIEW_START; } catch (_) {}
      v.play()
        .then(() => {
          card.classList.remove("loading");
          card.classList.add("previewing");
        })
        .catch(() => card.classList.remove("loading"));   // autoplay refused
    });

    card.addEventListener("mouseleave", () => stopPreview());

    // fade in only once real frames are available
    v.addEventListener("playing", () => card.classList.add("previewing"));
    v.addEventListener("error", () => card.classList.add("missing"));
  });
}

function stopPreview(){
  if (!previewing) return;
  const card = previewing.closest(".card");
  previewing.pause();
  card.classList.remove("previewing", "loading");
  previewing = null;
}

/* ---------- player ---------- */
function open(index){
  const c = visible[index];
  if (!c) return;
  stopPreview();
  openIndex = index;
  player.src = c.src;
  player.poster = c.poster;
  document.getElementById("modalTitle").textContent = epLabel(c) + " — " + c.title;
  document.getElementById("modalDesc").textContent = c.desc;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  player.play().catch(() => {});
  document.getElementById("close").focus();
}

function close(){
  player.pause();
  player.removeAttribute("src");
  player.load();
  modal.hidden = true;
  document.body.style.overflow = "";
  openIndex = -1;
}

function step(dir){
  const next = (openIndex + dir + visible.length) % visible.length;
  open(next);
}

/* ---------- events ---------- */
grid.addEventListener("click", e => {
  const card = e.target.closest(".card");
  if (card) open(Number(card.dataset.index));
});

filters.addEventListener("click", e => {
  const b = e.target.closest("button");
  if (!b) return;
  category = b.dataset.cat;
  filters.querySelectorAll("button").forEach(x =>
    x.setAttribute("aria-pressed", String(x.dataset.cat === category)));
  render();
});

search.addEventListener("input", e => { query = e.target.value; render(); });

document.getElementById("close").addEventListener("click", close);
document.getElementById("next").addEventListener("click", () => step(1));
document.getElementById("prev").addEventListener("click", () => step(-1));
modal.addEventListener("click", e => { if (e.target === modal) close(); });
player.addEventListener("ended", () => step(1));

document.addEventListener("keydown", e => {
  if (modal.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
});

document.getElementById("toTop").addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" }));

/* stop a preview if the tab loses focus */
window.addEventListener("blur", stopPreview);

/* ---------- start ---------- */
renderFilters();
render();
