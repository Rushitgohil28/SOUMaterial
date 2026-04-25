// app.js
const STORAGE_KEY = "soumaterial-data-v1";
const THEME_KEY = "soumaterial-theme";

const defaultData = {
  semesters: [
    {
      id: "sem-1",
      name: "Semester 1",
      subjects: [
        {
          id: "math-1",
          name: "Mathematics I",
          materials: [
            {
              id: "m1",
              title: "Unit 1: Sets and Logic",
              type: "Unit Note",
              link: "https://example.com/unit-1",
            },
            {
              id: "m2",
              title: "Semester 1 Syllabus",
              type: "Syllabus",
              link: "https://example.com/syllabus-sem1",
            },
          ],
        },
        {
          id: "prog-c",
          name: "Programming in C",
          materials: [
            {
              id: "m3",
              title: "Unit 2: Control Structures",
              type: "Unit Note",
              link: "https://example.com/c-unit-2",
            },
          ],
        },
      ],
    },
    {
      id: "sem-2",
      name: "Semester 2",
      subjects: [
        {
          id: "dsa",
          name: "Data Structures",
          materials: [
            {
              id: "m4",
              title: "Unit 1: Arrays and Linked List",
              type: "Unit Note",
              link: "https://example.com/dsa-unit-1",
            },
          ],
        },
      ],
    },
  ],
  timetable: [
    { id: "t1", day: "Monday", time: "10:00 - 11:00", subject: "Programming in C", room: "Lab-1" },
    { id: "t2", day: "Tuesday", time: "11:00 - 12:00", subject: "Mathematics I", room: "A-204" },
    { id: "t3", day: "Wednesday", time: "12:00 - 01:00", subject: "Data Structures", room: "A-105" },
  ],
  notices: [
    { id: "n1", title: "Submit Assignment", message: "Submit C assignment by Friday 5 PM.", date: "2026-04-24" },
    { id: "n2", title: "Internal Exam Notice", message: "Internal exam starts from 2026-05-03.", date: "2026-04-22" },
  ],
};

let data = loadData();

const app = document.getElementById("app");
const menuBtn = document.getElementById("menuBtn");
const mainNav = document.getElementById("mainNav");
const themeToggle = document.getElementById("themeToggle");
const themeText = document.getElementById("themeText");

menuBtn.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

window.addEventListener("hashchange", renderRoute);

mainNav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") mainNav.classList.remove("open");
});

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

applyTheme(localStorage.getItem(THEME_KEY) || "dark");
renderRoute();

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeText.textContent = theme === "dark" ? "Light" : "Dark";
}

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultData);
    const parsed = JSON.parse(stored);
    if (!parsed?.semesters || !parsed?.timetable || !parsed?.notices) {
      return structuredClone(defaultData);
    }
    return parsed;
  } catch {
    return structuredClone(defaultData);
  }
}

function tpl(id) {
  return document.getElementById(id).content.cloneNode(true);
}

function renderRoute() {
  data = loadData();
  const raw = location.hash.replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length) return renderHome();
  if (parts[0] === "semesters") return renderSemesters();
  if (parts[0] === "semester" && parts[1]) return renderSemester(parts[1]);
  if (parts[0] === "subject" && parts[1] && parts[2]) return renderSubject(parts[1], parts[2]);
  if (parts[0] === "timetable") return renderTimetable();
  if (parts[0] === "notices") return renderNotices();
  renderHome();
}

function renderHome() {
  app.innerHTML = "";
  const view = tpl("homeTemplate");
  const stats = view.getElementById("quickStats");
  const homeSemesterGrid = view.getElementById("homeSemesterGrid");
  const homeTimetableWrap = view.getElementById("homeTimetableWrap");
  const homeDaySearch = view.getElementById("homeTimetableDaySearch");
  const homeDaySearchBtn = view.getElementById("homeTimetableSearchBtn");
  const homeNoticeList = view.getElementById("homeNoticeList");

  const subjectCount = data.semesters.reduce((acc, s) => acc + s.subjects.length, 0);
  const noteCount = data.semesters.reduce(
    (acc, s) => acc + s.subjects.reduce((sum, sub) => sum + sub.materials.length, 0),
    0,
  );

  stats.innerHTML = `
    <article class="tile">
      <strong>${data.semesters.length}</strong>
      <span>Semesters Listed</span>
    </article>
    <article class="tile">
      <strong>${subjectCount}</strong>
      <span>Total Subjects</span>
    </article>
    <article class="tile">
      <strong>${noteCount}</strong>
      <span>Materials Available</span>
    </article>
    <article class="tile">
      <strong>${data.notices.length}</strong>
      <span>Active Notices</span>
    </article>
  `;

  if (!data.semesters.length) {
    homeSemesterGrid.innerHTML = `<p class="meta">No semester added yet.</p>`;
  } else {
    homeSemesterGrid.innerHTML = data.semesters
      .map(
        (sem) => `
        <article class="semester-card">
          <h3>${sem.name}</h3>
          <p class="meta">${sem.subjects.length} subjects</p>
          <a class="btn small" href="#/semester/${sem.id}">Open</a>
        </article>
      `,
      )
      .join("");
  }

  const paintHomeTimetable = () => {
    homeTimetableWrap.innerHTML = renderTimetableTable(homeDaySearch.value.trim());
  };
  homeDaySearch.value = getTodayDayName();
  homeDaySearch.addEventListener("input", paintHomeTimetable);
  homeDaySearchBtn.addEventListener("click", paintHomeTimetable);
  paintHomeTimetable();

  if (!data.notices.length) {
    homeNoticeList.innerHTML = `<p class="meta">No notices available.</p>`;
  } else {
    const notices = [...data.notices].sort((a, b) => (a.date < b.date ? 1 : -1));
    homeNoticeList.innerHTML = notices
      .map(
        (n) => `
        <article class="notice">
          <strong>${n.title}</strong>
          <p>${n.message}</p>
          <span class="meta">Date: ${n.date}</span>
        </article>
      `,
      )
      .join("");
  }

  app.appendChild(view);
}

function renderSemesters() {
  app.innerHTML = "";
  const view = tpl("semestersTemplate");
  const grid = view.getElementById("semesterGrid");

  if (!data.semesters.length) {
    grid.innerHTML = `<p class="meta">No semester added yet.</p>`;
  } else {
    grid.innerHTML = data.semesters
      .map(
        (sem) => `
        <article class="semester-card">
          <h3>${sem.name}</h3>
          <p class="meta">${sem.subjects.length} subjects</p>
          <a class="btn small" href="#/semester/${sem.id}">Open</a>
        </article>
      `,
      )
      .join("");
  }

  app.appendChild(view);
}

function renderSemester(semesterId) {
  const semester = data.semesters.find((s) => s.id === semesterId);
  if (!semester) return notFound("Semester not found.");
  app.innerHTML = "";
  const view = tpl("semesterTemplate");
  view.getElementById("semesterTitle").textContent = semester.name;
  const list = view.getElementById("subjectList");
  if (!semester.subjects.length) {
    list.innerHTML = `<p class="meta">No subject added in this semester yet.</p>`;
  } else {
    list.innerHTML = semester.subjects
      .map(
        (subject) => `
      <article class="subject-row">
        <div>
          <strong>${subject.name}</strong>
          <p class="meta">${subject.materials.length} files</p>
        </div>
        <a class="btn small" href="#/subject/${semester.id}/${subject.id}">View Files</a>
      </article>`,
      )
      .join("");
  }
  app.appendChild(view);
}

function renderSubject(semesterId, subjectId) {
  const semester = data.semesters.find((s) => s.id === semesterId);
  const subject = semester?.subjects.find((s) => s.id === subjectId);
  if (!semester || !subject) return notFound("Subject not found.");
  app.innerHTML = "";
  const view = tpl("subjectTemplate");
  view.getElementById("subjectTitle").textContent = `${semester.name} - ${subject.name}`;
  view.getElementById("backToSemester").href = `#/semester/${semester.id}`;
  const wrap = view.getElementById("materialTableWrap");

  if (!subject.materials.length) {
    wrap.innerHTML = `<p class="meta">No file added for this subject yet.</p>`;
  } else {
    wrap.innerHTML = `
      <table class="table">
        <thead>
          <tr>
            <th>File</th>
            <th>Type</th>
            <th>Open</th>
          </tr>
        </thead>
        <tbody>
          ${subject.materials
            .map(
              (m) => `
              <tr>
                <td>${m.title}</td>
                <td>${m.type}</td>
                <td>${
                  m.link
                    ? `<a class="btn small" href="${m.link}" target="_blank" rel="noopener noreferrer">Open</a>`
                    : `<span class="meta">No link</span>`
                }</td>
              </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  app.appendChild(view);
}

function renderTimetable() {
  app.innerHTML = "";
  const view = tpl("timetableTemplate");
  const wrap = view.getElementById("timetableWrap");
  const searchInput = view.getElementById("timetableDaySearch");
  const searchBtn = view.getElementById("timetableSearchBtn");
  searchInput.value = getTodayDayName();
  const paint = () => {
    wrap.innerHTML = renderTimetableTable(searchInput.value.trim());
  };
  searchInput.addEventListener("input", paint);
  searchBtn.addEventListener("click", paint);
  paint();
  app.appendChild(view);
}

function renderTimetableTable(dayQuery = "") {
  if (!data.timetable.length) {
    return `<p class="meta">No timetable added yet.</p>`;
  }

  const filtered = data.timetable.filter((entry) =>
    entry.day.toLowerCase().includes(dayQuery.toLowerCase()),
  );

  if (!filtered.length) {
    return `<p class="meta">No timetable found for this day search.</p>`;
  }

  const grouped = groupTimetable(filtered);

  return `
    <table class="table">
      <thead>
        <tr>
          <th>Day</th>
          <th>Schedule</th>
        </tr>
      </thead>
      <tbody>
        ${grouped
          .map(
            (dayRow) => `
            <tr>
              <td><strong>${dayRow.day}</strong></td>
              <td>
                ${dayRow.items
                  .map(
                    (item) => `
                    <div class="schedule-item">
                      <strong>${item.time}</strong> ${item.subject}${item.room ? ` (${item.room})` : ""}
                    </div>
                  `,
                  )
                  .join("")}
              </td>
            </tr>`,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function groupTimetable(entries) {
  const dayIndex = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7,
  };

  const groups = new Map();
  entries.forEach((entry) => {
    const normalizedDay = normalizeDay(entry.day);
    const key = normalizedDay.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, { day: normalizedDay, items: [] });
    }
    groups.get(key).items.push(entry);
  });

  const rows = [...groups.values()];

  rows.forEach((row) => {
    row.items.sort((a, b) => sortByStartTime(a.time, b.time));
  });

  rows.sort((a, b) => {
    const aKey = a.day.toLowerCase();
    const bKey = b.day.toLowerCase();
    const aOrder = dayIndex[aKey] || 99;
    const bOrder = dayIndex[bKey] || 99;
    return aOrder - bOrder;
  });

  return rows;
}

function sortByStartTime(timeA, timeB) {
  const parse = (timeRange) => {
    const start = timeRange.split("-")[0].trim().replace(".", ":");
    const [hStr, mStr] = start.split(":");
    const h = Number(hStr) || 0;
    const m = Number(mStr) || 0;
    return h * 60 + m;
  };
  return parse(timeA) - parse(timeB);
}

function getTodayDayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function normalizeDay(dayText) {
  const text = String(dayText || "").trim().toLowerCase();
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderNotices() {
  app.innerHTML = "";
  const view = tpl("noticesTemplate");
  const list = view.getElementById("noticeList");
  if (!data.notices.length) {
    list.innerHTML = `<p class="meta">No notices available.</p>`;
  } else {
    const notices = [...data.notices].sort((a, b) => (a.date < b.date ? 1 : -1));
    list.innerHTML = notices
      .map(
        (n) => `
        <article class="notice">
          <strong>${n.title}</strong>
          <p>${n.message}</p>
          <span class="meta">Date: ${n.date}</span>
        </article>
      `,
      )
      .join("");
  }
  app.appendChild(view);
}

function notFound(text) {
  app.innerHTML = `
    <section>
      <h2>${text}</h2>
      <a class="btn small" href="#/">Go Home</a>
    </section>
  `;
}
