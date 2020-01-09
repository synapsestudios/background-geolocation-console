import React from 'react';

function formatDate (date) {
  return `${new Date(date).toLocaleDateString()} ${new Date(date).toLocaleTimeString()}`;
}

export default function UploadDates ({ uploadDates, selectedUploadDate, setSelectedUploadDate, onDeleteLogs }) {
  return (
    <div>
      <ul>
        {uploadDates.map(date => {
          const formattedDate = formatDate(date);
          return (
            <li key={date}>
              <a onClick={() => setSelectedUploadDate(date)}>
                {date === selectedUploadDate ? <b>{formattedDate}</b> : formattedDate}
              </a>
              <a href='#' onClick={() => onDeleteLogs(date)}>
                (delete)
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
