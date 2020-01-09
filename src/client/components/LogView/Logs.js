import React from 'react';

export default function Logs ({ logs }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Entries</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => {
          return (
            <tr>
              <td>{log.entry}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
