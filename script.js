import { initializeApp } from "firebase/app";

// Firebase configuration (replace with your Firebase project's config)
const firebaseConfig = {
    apiKey: "AIzaSyDSWuVpts51J-Tx_-eseP42pLLjmB1e7KQ",
    authDomain: "bweakfast-without-backend.firebaseapp.com",
    databaseURL: "https://bweakfast-without-backend-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "bweakfast-without-backend",
    storageBucket: "bweakfast-without-backend.firebasestorage.app",
    messagingSenderId: "338641180715",
    appId: "1:338641180715:web:c7f2109a52db4e44f6b26e"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('note-form');
    const calendarGrid = document.getElementById('calendar-grid');

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

    function renderCalendar(calendarData) {
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

        const participantsRef = db.ref(`calendarData/${date}`);
        participantsRef.once('value', (snapshot) => {
            const participants = snapshot.val() || [];
            if (!participants.includes(name)) {
                participants.push(name);
                participantsRef.set(participants);
            }
        });

        form.reset();
    });

    // Listen for changes in the database
    const calendarDataRef = db.ref('calendarData');
    calendarDataRef.on('value', (snapshot) => {
        const calendarData = snapshot.val() || {};
        renderCalendar(calendarData);
    });
});
