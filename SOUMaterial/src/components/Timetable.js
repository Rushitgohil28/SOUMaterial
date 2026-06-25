import { triggerProgressBar } from './Navbar.js?v=2';

export async function loadTimetable(selectedDay = 'Monday') {
    const container = document.getElementById('app-container');
    container.innerHTML = '<p style="text-align:center; padding:3rem;">Loading timetable...</p>';

    try {
        // Fetch JSON data
        const response = await fetch('./src/data/timetable.json');
        const data = await response.json();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let html = `
            <div style="margin-bottom: 2rem; text-align: center;">
                <h1 style="font-size: 2.2rem; font-family: 'Outfit', sans-serif; margin-bottom: 0.5rem;">Class Timetable</h1>
                <p style="color: var(--text-secondary); font-size: 1rem;">View lectures, faculties, timings, and classroom details.</p>
            </div>
            <div class="day-nav">
        `;
        days.forEach(day => {
            const isActive = day === selectedDay ? 'active' : '';
            html += `<button class="day-btn ${isActive}" data-day="${day}">${day}</button>`;
        });
        html += `</div><div class="grid-timetable">`;

        const dayData = data.timetable.find(d => d.day === selectedDay);

        if (dayData && dayData.schedule.length > 0) {
            dayData.schedule.forEach((lec, idx) => {
                if (lec.type === "Break") return; // Skip rendering breaks
                html += `
                <div class="timetable-card timetable-card-animate" style="animation-delay: ${idx * 0.05}s;">
                    <h3>${lec.subject}</h3>
                    <p><strong>Time:</strong> ${lec.time}</p>
                    <p><strong>Faculty:</strong> ${lec.faculty || "See Batches"}</p>
                    <p><strong>Room:</strong> ${lec.room}</p>
                </div>`;
            });
        } else {
            html += `
                <div style="grid-column:1/-1; text-align:center; padding: 4rem 1rem; border:1px dashed var(--border-subtle); border-radius: var(--radius-lg); background: var(--bg-surface);">
                    <p style="color: var(--text-secondary); font-size: 1rem;">No lectures scheduled for ${selectedDay}.</p>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Re-attach event listeners to new day buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                triggerProgressBar();
                loadTimetable(e.target.dataset.day);
            });
        });

    } catch (error) {
        console.error("Error loading timetable", error);
        container.innerHTML = `<p style="color:red; text-align:center; padding: 3rem;">Error loading timetable. Ensure you are running a local server.</p>`;
    }
}