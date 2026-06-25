export async function loadTimetable(selectedDay = 'Monday') {
    const container = document.getElementById('app-container');
    container.innerHTML = '<p>Loading timetable...</p>';

    try {
        // Fetch JSON data
        const response = await fetch('./src/data/timetable.json');
        const data = await response.json();

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let html = `<div class="day-nav">`;
        days.forEach(day => {
            const isActive = day === selectedDay ? 'active' : '';
            html += `<button class="day-btn ${isActive}" data-day="${day}">${day}</button>`;
        });
        html += `</div><div class="grid">`;

        const dayData = data.timetable.find(d => d.day === selectedDay);

        if (dayData && dayData.schedule.length > 0) {
            dayData.schedule.forEach((lec, idx) => {
                if (lec.type === "Break") return; // Skip rendering breaks
                html += `
                <div class="card timetable-card-animate" style="animation-delay: ${idx * 0.05}s;">
                    <h3>${lec.subject}</h3>
                    <p><strong>Time:</strong> ${lec.time}</p>
                    <p><strong>Faculty:</strong> ${lec.faculty || "See Batches"}</p>
                    <p><strong>Room:</strong> ${lec.room}</p>
                </div>`;
            });
        } else {
            html += `<p>No lectures scheduled.</p>`;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Re-attach event listeners to new day buttons
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => loadTimetable(e.target.dataset.day));
        });

    } catch (error) {
        container.innerHTML = `<p style="color:red;">Error loading timetable. Ensure you are running a local server.</p>`;
    }
}