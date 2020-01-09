import { Op } from 'sequelize';

import LogModel from '../database/LogModel';
import { checkCompany, filterByCompany, desc } from '../libs/utils';

export async function bulkCreateLogs (entries, metaData) {
  const now = new Date();

  const logs = entries.map(entry => ({
    entry,
    device_id: metaData.device_id || null,
    version: metaData.version,
    manufacturer: metaData.manufacturer,
    platform: metaData.platform,
    model: metaData.model,
    uploaded_at: now,
  }));

  await LogModel.bulkCreate(logs);
}

export async function getLogBatchDates () {
  const records = await LogModel.findAll({
    attributes: ['uploaded_at'],
    group: ['uploaded_at'],
    order: [['uploaded_at', 'DESC']],
  });
  return records.map(record => record.uploaded_at);
}

export async function getLogs (uploaded_at) {
  const records = await LogModel.findAll({
    where: {
      uploaded_at: uploaded_at,
    },
  });
  return records;
}

export async function deleteLogs (uploaded_at) {
  await LogModel.destroy({
    where: { uploaded_at: uploaded_at },
  });
}
