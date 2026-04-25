// admin.js
const STORAGE_KEY = "soumaterial-data-v1";
const THEME_KEY = "soumaterial-theme";
const ADMIN_SESSION_KEY = "soumaterial-admin-session";
const ADMIN_PIN = "souadmin123";

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

const adminApp = document.getElementById("adminApp");
const themeToggle = document.getElementById("themeToggle");
const themeText = document.getElementById("themeText");

window.addEventListener("beforeunload", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
});

themeToggle.addEventListener("click", () => {
  const current = document.body.dataset.theme;
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

applyTheme(localStorage.getItem(THEME_KEY) || "dark");
renderAdminPage();

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  themeText.textContent = theme === "dark" ? "Light" : "Dark";
}

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
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

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderAdminPage() {
  data = loadData();
  const loggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  adminApp.innerHTML = `
    <section>
      <h2>Admin Panel</h2>
      <p class="sub">Publish and manage semester materials, timetable, and notices.</p>
      <div id="adminAuth"></div>
      <div id="adminBody" class="admin-body hidden"></div>
    </section>
  `;

  const auth = adminApp.querySelector("#adminAuth");
  const body = adminApp.querySelector("#adminBody");

  if (!loggedIn) {
    auth.innerHTML = `
      <form id="loginForm">
        <label for="pinInput">Enter PIN</label>
        <input id="pinInput" type="password" placeholder="Enter PIN" required />
        <button class="btn" type="submit">Login</button>
      </form>
    `;
    adminApp.querySelector("#loginForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = adminApp.querySelector("#pinInput").value.trim();
      if (pin === ADMIN_PIN) {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        renderAdminPage();
      } else {
        alert("Wrong PIN.");
      }
    });
    return;
  }

  auth.innerHTML = `
    <div class="row-line">
      <span class="meta">Admin session active</span>
      <button id="logoutBtn" class="danger-btn" type="button">Logout</button>
    </div>
  `;
  adminApp.querySelector("#logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    renderAdminPage();
  });

  body.classList.remove("hidden");
  body.innerHTML = adminFormsHTML();
  bindAdminActions(body);
  renderAdminLists(body);
}

function adminFormsHTML() {
  return `
    <div class="admin-grid">
      <form id="semesterForm">
        <h3>Add Semester</h3>
        <label for="semesterName">Semester Name</label>
        <input id="semesterName" required placeholder="Semester 3" />
        <button class="btn" type="submit">Publish Semester</button>
      </form>

      <form id="subjectForm">
        <h3>Add Subject</h3>
        <label for="subjectSemester">Semester</label>
        <select id="subjectSemester" required>
          ${data.semesters.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
        </select>
        <label for="subjectName">Subject Name</label>
        <input id="subjectName" required placeholder="Computer Networks" />
        <button class="btn" type="submit">Publish Subject</button>
      </form>

      <form id="materialForm">
        <h3>Add Material</h3>
        <label for="materialSemester">Semester</label>
        <select id="materialSemester" required>
          ${data.semesters.map((s) => `<option value="${s.id}">${s.name}</option>`).join("")}
        </select>
        <label for="materialSubject">Subject</label>
        <select id="materialSubject" required></select>
        <label for="materialTitle">File Title</label>
        <input id="materialTitle" required placeholder="Unit 2: OSI Model" />
        <div class="inline">
          <div>
            <label for="materialType">Type</label>
            <input id="materialType" placeholder="Unit Note / Syllabus" />
          </div>
          <div>
            <label for="materialLink">Link</label>
            <input id="materialLink" placeholder="https://..." />
          </div>
        </div>
        <button class="btn" type="submit">Publish Material</button>
      </form>

      <form id="timetableForm">
        <h3>Add Timetable Row</h3>
        <div class="inline">
          <div>
            <label for="timeDay">Day</label>
            <input id="timeDay" required placeholder="Thursday" />
          </div>
          <div>
            <label for="timeSlot">Time</label>
            <input id="timeSlot" required placeholder="10:00 - 11:00" />
          </div>
        </div>
        <div class="inline">
          <div>
            <label for="timeSubject">Subject</label>
            <input id="timeSubject" required placeholder="DBMS" />
          </div>
          <div>
            <label for="timeRoom">Room</label>
            <input id="timeRoom" placeholder="A-301" />
          </div>
        </div>
        <button class="btn" type="submit">Publish Timetable</button>
      </form>

      <form id="noticeForm">
        <h3>Add Notice</h3>
        <label for="noticeTitle">Notice Title</label>
        <input id="noticeTitle" required placeholder="Submit Assignment" />
        <label for="noticeMessage">Notice Message</label>
        <textarea id="noticeMessage" required placeholder="Submit by tomorrow 12 PM."></textarea>
        <label for="noticeDate">Date</label>
        <input id="noticeDate" type="date" required />
        <button class="btn" type="submit">Publish Notice</button>
      </form>
    </div>
    <section>
      <h3>Manage Published Content</h3>
      <div id="adminLists" class="admin-list"></div>
    </section>
  `;
}

function bindAdminActions(root) {
  const semesterForm = root.querySelector("#semesterForm");
  const subjectForm = root.querySelector("#subjectForm");
  const materialForm = root.querySelector("#materialForm");
  const timetableForm = root.querySelector("#timetableForm");
  const noticeForm = root.querySelector("#noticeForm");
  const materialSemester = root.querySelector("#materialSemester");
  const materialSubject = root.querySelector("#materialSubject");

  const syncMaterialSubject = () => {
    const semester = data.semesters.find((s) => s.id === materialSemester.value);
    materialSubject.innerHTML = (semester?.subjects || [])
      .map((s) => `<option value="${s.id}">${s.name}</option>`)
      .join("");
  };

  materialSemester.addEventListener("change", syncMaterialSubject);
  syncMaterialSubject();

  semesterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = root.querySelector("#semesterName").value.trim();
    if (!name) return;
    data.semesters.push({ id: uid("sem"), name, subjects: [] });
    saveData();
    renderAdminPage();
  });

  subjectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const semesterId = root.querySelector("#subjectSemester").value;
    const name = root.querySelector("#subjectName").value.trim();
    const semester = data.semesters.find((s) => s.id === semesterId);
    if (!semester || !name) return;
    semester.subjects.push({ id: uid("sub"), name, materials: [] });
    saveData();
    renderAdminPage();
  });

  materialForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const semesterId = materialSemester.value;
    const subjectId = materialSubject.value;
    const title = root.querySelector("#materialTitle").value.trim();
    const type = root.querySelector("#materialType").value.trim() || "Material";
    const link = root.querySelector("#materialLink").value.trim();
    const semester = data.semesters.find((s) => s.id === semesterId);
    const subject = semester?.subjects.find((s) => s.id === subjectId);
    if (!subject || !title) return;
    subject.materials.push({ id: uid("mat"), title, type, link });
    saveData();
    renderAdminPage();
  });

  timetableForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const day = root.querySelector("#timeDay").value.trim();
    const time = root.querySelector("#timeSlot").value.trim();
    const subject = root.querySelector("#timeSubject").value.trim();
    const room = root.querySelector("#timeRoom").value.trim();
    if (!day || !time || !subject) return;
    data.timetable.push({ id: uid("tt"), day, time, subject, room });
    saveData();
    renderAdminPage();
  });

  noticeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = root.querySelector("#noticeTitle").value.trim();
    const message = root.querySelector("#noticeMessage").value.trim();
    const date = root.querySelector("#noticeDate").value;
    if (!title || !message || !date) return;
    data.notices.push({ id: uid("nt"), title, message, date });
    saveData();
    renderAdminPage();
  });
}

function renderAdminLists(root) {
  const list = root.querySelector("#adminLists");
  const materialItems = data.semesters.flatMap((sem) =>
    sem.subjects.flatMap((sub) =>
      sub.materials.map((m) => ({
        id: m.id,
        label: `${sem.name} - ${sub.name} - ${m.title}`,
        kind: "material",
      })),
    ),
  );

  const noticeItems = data.notices.map((n) => ({
    id: n.id,
    label: `Notice - ${n.title}`,
    kind: "notice",
  }));

  const ttItems = data.timetable.map((t) => ({
    id: t.id,
    label: `Timetable - ${t.day} ${t.time} ${t.subject}`,
    kind: "timetable",
  }));

  const all = [...materialItems, ...noticeItems, ...ttItems];

  if (!all.length) {
    list.innerHTML = `<p class="meta">No content to manage yet.</p>`;
    return;
  }

  list.innerHTML = all
    .map(
      (item) => `
      <div class="row-line">
        <span>${item.label}</span>
        <button class="danger-btn" data-kind="${item.kind}" data-id="${item.id}" type="button">Delete</button>
      </div>
    `,
    )
    .join("");

  list.querySelectorAll("button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const { kind, id } = btn.dataset;
      removeItem(kind, id);
      saveData();
      renderAdminPage();
    });
  });
}

function removeItem(kind, id) {
  if (kind === "notice") {
    data.notices = data.notices.filter((n) => n.id !== id);
    return;
  }
  if (kind === "timetable") {
    data.timetable = data.timetable.filter((t) => t.id !== id);
    return;
  }
  if (kind === "material") {
    data.semesters.forEach((sem) => {
      sem.subjects.forEach((sub) => {
        sub.materials = sub.materials.filter((m) => m.id !== id);
      });
    });
  }
}
