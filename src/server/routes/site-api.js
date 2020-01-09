import fs from 'fs';
import { Router } from 'express';
import { isEncryptedRequest, decrypt } from '../libs/RNCrypto';
import { AccessDeniedError, isDDosCompany, return1Gbfile, extractLinesFromGzFile } from '../libs/utils';
import { getDevices, deleteDevice } from '../models/Device';
import { bulkCreateLogs, getLogBatchDates, getLogs, deleteLogs } from '../models/Log';
import { getOrgs } from '../models/Org';
import { createLocation, deleteLocations, getLatestLocation, getLocations, getStats } from '../models/Location';

const router = new Router();

/**
 * GET /company_tokens
 */
router.get('/company_tokens', async function (req, res) {
  try {
    const orgs = await getOrgs(req.query);
    res.send(orgs);
  } catch (err) {
    console.error('/company_tokens', err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

/**
 * GET /devices
 */
router.get('/devices', async function (req, res) {
  try {
    const devices = await getDevices(req.query);
    res.send(devices);
  } catch (err) {
    console.error('/devices', err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.delete('/devices/:id', async function (req, res) {
  try {
    console.log(`DELETE /devices/${req.params.id}?${JSON.stringify(req.query)}\n`.green);
    await deleteDevice({ ...req.query, id: req.params.id });
    res.send({ success: true });
  } catch (err) {
    console.error('/devices', JSON.stringify(req.params), JSON.stringify(req.query), err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.get('/stats', async function (req, res) {
  try {
    const stats = await getStats();
    res.send(stats);
  } catch (err) {
    console.info('/stats', err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.get('/locations/latest', async function (req, res) {
  console.log('GET /locations %s'.green, JSON.stringify(req.query));
  try {
    const latest = await getLatestLocation(req.query);
    res.send(latest);
  } catch (err) {
    console.info('/locations/latest', JSON.stringify(req.query), err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

/**
 * GET /locations
 */
router.get('/locations', async function (req, res) {
  console.log('GET /locations %s'.green, JSON.stringify(req.query));

  try {
    const locations = await getLocations(req.query);
    res.send(locations);
  } catch (err) {
    console.info('get /locations', JSON.stringify(req.query), err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

/**
 * POST /locations
 */
router.post('/locations', async function (req, res) {
  const { body } = req;
  const data = isEncryptedRequest(req) ? decrypt(body.toString()) : body;
  const locations = Array.isArray(data) ? data : data ? [data] : [];

  if (locations.find(({ company_token: org }) => isDDosCompany(org))) {
    return return1Gbfile(res);
  }

  try {
    await createLocation(locations);
    res.send({ success: true });
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return res.status(403).send({ error: err.toString() });
    }
    console.error('post /locations', err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

/**
 * POST /locations
 */
router.post('/locations/:company_token', async function (req, res) {
  const { company_token: org } = req.params;

  console.info('locations:post'.green, 'org:name'.green, org);

  if (isDDosCompany(org)) {
    return return1Gbfile(res);
  }

  const data = isEncryptedRequest(req) ? decrypt(req.body.toString()) : req.body;
  data.company_token = org;

  try {
    await createLocation(data);

    res.send({ success: true });
  } catch (err) {
    if (err instanceof AccessDeniedError) {
      return res.status(403).send({ error: err.toString() });
    }
    console.error('post /locations', org, err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.delete('/locations', async function (req, res) {
  console.info('locations:delete:query'.green, JSON.stringify(req.query));

  try {
    await deleteLocations(req.query);

    res.send({ success: true });
    res.status(500).send({ error: 'Something failed!' });
  } catch (err) {
    console.info('delete /locations', JSON.stringify(req.query), err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

router.post('/locations_template', async function (req, res) {
  console.log('POST /locations_template\n%s\n'.green, JSON.stringify(req.body));

  res.set('Retry-After', 5);
  res.send({ success: true });
});

router.post('/configure', async function (req, res) {
  var response = {
    access_token: 'e7ebae5e-4bea-4d63-8f28-8a104acd2f4c',
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: '2a69e1cd-d7db-44f6-87fc-3d66c4505ee4',
    scope: 'openid+email+profile+phone+address+group',
  };
  res.send(response);
});

/**
 * Fetch iOS simulator city_drive route
 */
router.get('/data/city_drive', async function (req, res) {
  console.log('GET /data/city_drive.json'.green);
  fs.readFile('./data/city_drive.json', 'utf8', function (_err, data) {
    res.send(data);
  });
});

/**
 * GET Logs
 */
router.get('/log_batches', async function (req, res) {
  try {
    const logBatchDates = await getLogBatchDates();
    res.send(logBatchDates);
  } catch (err) {
    console.info('GET /log_batches', err);
    res.status(500).send({ error: err.message });
  }
});

router.get('/batch_logs', async function (req, res) {
  const { uploaded_at } = req.query;
  if (!uploaded_at) {
    console.info('GET /logs', 'Must provide `uploaded_at` date');
    res.status(500).send({ error: 'Must provide `uploaded_at` date' });
  }
  try {
    const logBatchDates = await getLogs(uploaded_at);
    res.send(logBatchDates);
  } catch (err) {
    console.info('GET /log_batches', err);
    res.status(500).send({ error: err.message });
  }
});

router.delete('/logs', async function (req, res) {
  const { uploaded_at } = req.query;
  if (!uploaded_at) {
    console.info('DELETE /logs', 'Must provide `uploaded_at` date');
    res.status(500).send({ error: 'Must provide `uploaded_at` date' });
  }
  try {
    await deleteLogs(uploaded_at);
    res.send({ success: true });
  } catch (err) {
    console.info('GET /log_batches', err);
    res.status(500).send({ error: err.message });
  }
});

/**
 * POST Logs
 */
router.post('/logs', async function (req, res) {
  try {
    const onEntriesExtracted = new Promise((resolve, reject) => {
      req.busboy.on('file', async (fieldname, file, filename) => {
        console.log('[ file ]:', filename);
        const entries = await extractLinesFromGzFile(file);
        console.log('Extracted ', entries.length, ' lines');
        resolve(entries);
      });
    });

    const onMetaDataExtracted = new Promise((resolve, reject) => {
      let metaData;
      req.busboy.on('field', (key, value) => {
        console.log('[', key, ']:', value);
        metaData = {
          ...metaData,
          [key]: value,
        };
      });
      req.busboy.on('finish', async () => {
        console.log('Finshed Parsing');
        resolve(metaData);
      });
    });

    Promise.all([onEntriesExtracted, onMetaDataExtracted]).then(async ([entries, metaData]) => {
      await bulkCreateLogs(entries, metaData);
      console.log('Saved ', entries.length, ' log entries.');
      res.send({ success: true });
    });

    req.pipe(req.busboy);
  } catch (err) {
    console.error('post /logs', err);
    res.status(500).send({ error: 'Something failed!' });
  }
});

export default router;
