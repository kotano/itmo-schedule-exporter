import * as React from 'react';
import { useState } from 'react';
import { createEvents } from 'ics';

const filename = 'schedule.ics';

const getParsedTime = (date) => [
  date.getFullYear(),
  date.getMonth() + 1, // JS to ISO month format
  date.getDate(),
  date.getHours(),
  date.getMinutes(),
];

const getEvents = (response) => {
  if (!response) return;
  return response.data
    .filter((day) => day.lessons.length !== 0)
    .map((studyDay) =>
      studyDay.lessons.map((lesson) => {
        // Convert to ISO format
        const start = new Date(`${studyDay.date}T${lesson.time_start}`);
        const end = new Date(`${studyDay.date}T${lesson.time_end}`);

        return {
          start: getParsedTime(start),
          end: getParsedTime(end),
          title: lesson.subject ?? '',
          description: lesson.note ?? '',
          location: `${lesson.building} ауд. ${lesson.room}`,
          url: 'https://my.itmo.ru/schedule',
          busyStatus: 'BUSY',
        };
      })
    )
    .flat();
};

const App: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [token, setToken] = useState('');

  const handleDownload = async () => {
    try {
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required');
      }
      const response = await fetch(
        `https://my.itmo.ru/api/schedule/schedule/personal?date_start=${
          startDate.toISOString().split('T')[0]
        }&date_end=${endDate.toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `${token}`,
            'accept-language': 'ru',
          },
        }
      );
      const data = await response.json();
      const events = getEvents(data);
      const { error, value } = await createEvents(events);
      if (error) throw error;
      const blob = new File([value], filename, {
        type: 'text/calendar;charset=utf-8',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <form>
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate?.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate?.toISOString().split('T')[0]}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor="token">Token:</label>
          <input
            type="text"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </div>
        <button type="button" onClick={handleDownload}>
          Download
        </button>
      </form>
    </div>
  );
};

export default App;
