document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('note-form');
    const calendarGrid = document.getElementById('calendar-grid');

    // Store calendar data in localStorage
    const calendarData = JSON.parse(localStorage.getItem('calendarData')) || {};

    function formatDate(date) {
        const options = { weekday: 'short', day: '2-digit', month: 'short' };
        return new Date(date).toLocaleDateString('fi-FI', options);
    }

    function getWeekDates() {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 14; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            dates.push(day.toISOString().split('T')[0]);
        }
        return dates;
    }

    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const weekDates = getWeekDates();

        // Filter dates with entries
        const activeDays = weekDates.filter(date => calendarData[date]);

        // Find the day with the most participants
        let maxDay = null;
        let maxCount = 0;

        activeDays.forEach(date => {
            const participants = calendarData[date];
            if (participants.length > maxCount) {
                maxCount = participants.length;
                maxDay = date;
            }
        });

        activeDays.forEach(date => {
            const participants = calendarData[date] || [];
            const dayBox = document.createElement('div');
            dayBox.classList.add('day-box');
            if (date === maxDay) {
                dayBox.classList.add('highlight');
            }

            const header = document.createElement('div');
            header.classList.add('day-header');
            header.textContent = formatDate(date);

            const content = document.createElement('div');
            content.classList.add('day-content');
            if (participants.length > 0) {
                participants.forEach(person => {
                    const personDiv = document.createElement('div');
                    personDiv.classList.add('person');
                    personDiv.textContent = person;
                    content.appendChild(personDiv);
                });
            } else {
                const noData = document.createElement('div');
                noData.textContent = 'Ei ilmoitettuja';
                content.appendChild(noData);
            }

            dayBox.appendChild(header);
            dayBox.appendChild(content);
            calendarGrid.appendChild(dayBox);
        });
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const date = document.getElementById('date').value;
        const name = document.getElementById('name').value;

        if (!name.match(/^[A-Za-zÅÄÖåäö]+$/)) {
            alert('Nimi saa sisältää vain kirjaimia.');
            return;
        }

        if (!calendarData[date]) {
            calendarData[date] = [];
        }
        if (!calendarData[date].includes(name)) {
            calendarData[date].push(name);
        }

        // Save to localStorage
        localStorage.setItem('calendarData', JSON.stringify(calendarData));

        renderCalendar();
        form.reset();
    });

    // Initial render
    renderCalendar();
});
