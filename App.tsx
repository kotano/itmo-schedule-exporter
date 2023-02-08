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
      const file = new File([value], filename, {
        type: 'text/calendar;charset=utf-8',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = filename;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="App">
      <div className="mx-auto w-full max-w-sm">
        <form>
          <div className="flex items-center mt-4">
            <label
              htmlFor="startDate"
              className="text-gray-700 font-medium pr-2"
            >
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate?.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="bg-gray-200 border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="flex items-center mt-4">
            <label htmlFor="endDate" className="text-gray-700 font-medium pr-2">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate?.toISOString().split('T')[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="bg-gray-200 border border-gray-300 rounded p-2 w-full"
            />
          </div>
          <div className="flex items-center mt-4">
            <label htmlFor="token" className="text-gray-700 font-medium pr-2">
              Token:
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="bg-gray-200 border border-gray-300 rounded p-2 w-full"
            />
            <a target="_blank" href="https://my.itmo.ru/schedule">
              <button
                type="button"
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-4 rounded ml-2"
              >
                Get token
              </button>
            </a>
          </div>
        </form>
        <button
          type="button"
          onClick={handleDownload}
          className="bg-red-500 hover:bg-red-400 text-white font-medium py-2 px-4 mt-4 rounded"
        >
          Download
        </button>
        <div className="mt-4">
          <a
            target="_blank"
            href="https://calendar.google.com/calendar/u/0/r/settings/export"
          >
            <button className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium py-2 px-4 rounded">
              Go to Google Calendar
            </button>
          </a>
        </div>

        <div className="mt-4 text-gray-700 font-medium">
          <p>Usage Info:</p>
          <p>1. Enter start date and end date</p>
          <p>
            2. Acquire access token from authorization header from requests on{' '}
            <a
              href="https://my.itmo.ru/schedule"
              target="_blank"
              className="text-indigo-500 hover:text-indigo-400"
            >
              https://my.itmo.ru/schedule
            </a>
          </p>
          <p>3. Enter token in the Token input field</p>
          <p>4. Press the "Download" button</p>
          <p>
            5. Go to Google Calendar and import the generated .ics file by
            clicking on the "Go to Google Calendar" button
          </p>

          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/qUDZW00croU"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default App;
