// @flow
import React, { useEffect, useState } from 'react';
import { API_URL } from '~/constants';
import UploadDates from './UploadDates';
import Logs from './Logs';

export type Log = {|
  id: string,
  entry: string,
  device_id: string | null,
  device_id: string | null,
  manufacturer: string,
  version: string,
  platform: string,
  model: string,
  uploaded_at: string,
|};

async function fetchUploadDates () {
  const response = await fetch(`${API_URL}/log_batches`);
  const batchDates = await response.json();
  return batchDates;
}

async function fetchLogs (uploadDate: string) {
  const response = await fetch(`${API_URL}/batch_logs?uploaded_at=${uploadDate}`);
  const logs = await response.json();
  return logs;
}

async function deleteLog (uploadDate: string) {
  const response = await fetch(`${API_URL}/logs?uploaded_at=${uploadDate}`, { method: 'DELETE' });
}

export default function LogView () {
  const [logs, setLogs] = useState([]);
  const [selectedUploadDate, setSelectedUploadDate] = useState('');
  const [uploadDates, setUploadDates] = useState([]);

  useEffect(() => {
    fetchUploadDates().then(setUploadDates);
  }, []);

  useEffect(() => {
    if (selectedUploadDate) {
      fetchLogs(selectedUploadDate).then(setLogs);
    }
  }, [selectedUploadDate]);

  function onDeleteLogs (uploadDate) {
    if (confirm('Are you sure you want to delete these logs?')) {
      if (uploadDate === selectedUploadDate) {
        setSelectedUploadDate('');
        setLogs([]);
      }
      deleteLog(uploadDate).then(() => {
        setUploadDates(uploadDates.filter(d => d !== uploadDate));
      });
    }
  }

  return (
    <div>
      <h1>Log Viewer</h1>
      <div className='pane left'>
        <UploadDates
          uploadDates={uploadDates}
          onDeleteLogs={onDeleteLogs}
          selectedUploadDate={selectedUploadDate}
          setSelectedUploadDate={setSelectedUploadDate}
        ></UploadDates>
      </div>
      <div className='pane right'>
        <Logs logs={logs}></Logs>
      </div>
    </div>
  );
}
