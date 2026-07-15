import { Location } from '../location/location.model.js';
import { Report } from './report.model.js';
import { buildDefaultChecklist, CHECKLIST_SECTIONS } from './checklist.template.js';
import { generateMonthGroupedExcel } from './report.excel.js';
import {
  saveChecklistPhoto,
  UPLOAD_ROOT,
} from './report.upload.js';

function checklistToObject(checklist) {
  if (!checklist) {
    return buildDefaultChecklist();
  }
  if (checklist instanceof Map) {
    return Object.fromEntries(
      [...checklist.entries()].map(([key, value]) => [
        key,
        value && typeof value.toObject === 'function' ? value.toObject() : value,
      ]),
    );
  }
  return checklist;
}

function ensureUnits(report) {
  if (Array.isArray(report.units) && report.units.length > 0) {
    return false;
  }

  report.units = [
    {
      no: '1',
      name: report.locationName || 'Unit 1',
      checklist: buildDefaultChecklist(),
    },
  ];
  report.markModified('units');
  if (report.status === 'open') {
    report.status = 'in_progress';
  }
  return true;
}

function serializeReport(report) {
  const obj = report.toObject();
  obj.units = (obj.units || []).map(unit => ({
    ...unit,
    _id: unit._id?.toString?.() || unit._id,
    checklist: checklistToObject(unit.checklist),
  }));
  return obj;
}

function getBaseUrl(req) {
  const host = req.get('host');
  const protocol = req.protocol || 'http';
  return `${protocol}://${host}`;
}

function addContributor(report, userId, userName) {
  const id = String(userId || '').trim();
  const name = String(userName || '').trim();
  if (!id || !name) {
    return false;
  }

  if (!Array.isArray(report.contributors)) {
    report.contributors = [];
  }

  const exists = report.contributors.some(
    person => String(person.userId) === id,
  );
  if (exists) {
    return false;
  }

  report.contributors.push({ userId: id, userName: name });
  return true;
}

function buildCheckedByLabel(report) {
  const names = [];
  for (const person of report.contributors || []) {
    const name = String(person.userName || '').trim();
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  return names.join(', ');
}

export async function listReports(req, res) {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    const result = [];
    for (const report of reports) {
      if (ensureUnits(report)) {
        await report.save();
      }
      result.push(serializeReport(report));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getReportById(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (ensureUnits(report)) {
      await report.save();
    }
    res.json(serializeReport(report));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function createReport(req, res) {
  try {
    const { locationId, createdById, createdByName } = req.body || {};

    if (!locationId || !createdById || !createdByName) {
      return res.status(400).json({
        message: 'locationId, createdById, and createdByName are required',
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ message: 'Location not found' });
    }

    const report = await Report.create({
      locationId: location._id,
      locationName: location.name,
      createdById,
      createdByName,
      checkedBy: '',
      contributors: [],
      status: 'open',
      units: [
        {
          no: '1',
          name: location.name,
          checklist: buildDefaultChecklist(),
        },
      ],
    });

    const io = req.app.get('io');
    io?.emit('report:created', serializeReport(report));

    res.status(201).json(serializeReport(report));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.status === 'completed') {
      const { note, leaderSign } = req.body || {};
      if (typeof note === 'string') {
        report.note = note;
      }
      if (typeof leaderSign === 'string') {
        report.leaderSign = leaderSign;
      }
      await report.save();
      const payload = serializeReport(report);
      const io = req.app.get('io');
      io?.emit('report:updated', payload);
      return res.json(payload);
    }

    const {
      note,
      leaderSign,
      units,
      status,
      userId,
      userName,
    } = req.body || {};

    // checkedBy / contributors hanya diisi saat ada kerja nyata (update checklist),
    // bukan hanya buka card
    if (typeof note === 'string') {
      report.note = note;
    }
    if (typeof leaderSign === 'string') {
      report.leaderSign = leaderSign;
    }
    if (Array.isArray(units)) {
      addContributor(report, userId, userName);
      report.units = units.map((unit, index) => {
        const existing =
          (unit._id && report.units.id(String(unit._id))) ||
          report.units[index] ||
          null;
        const previous = checklistToObject(existing?.checklist);
        const incoming = unit.checklist || {};
        const merged = { ...previous };

        for (const [checkKey, value] of Object.entries(incoming)) {
          merged[checkKey] = {
            ...(previous[checkKey] || {}),
            ...(value || {}),
            photoUrl:
              value?.photoUrl || previous[checkKey]?.photoUrl || '',
            photoPath:
              value?.photoPath || previous[checkKey]?.photoPath || '',
          };
        }

        return {
          _id: existing?._id || unit._id,
          no: String(unit.no || existing?.no || '1'),
          name: unit.name || existing?.name || report.locationName,
          checklist: merged,
        };
      });
      report.markModified('units');
    }
    if (status === 'in_progress' || status === 'open') {
      report.status = status;
    }

    await report.save();
    const io = req.app.get('io');
    io?.emit('report:updated', serializeReport(report));
    res.json(serializeReport(report));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function uploadCheckPhoto(req, res) {
  try {
    const { id, unitId, key } = req.params;
    const { imageBase64, userId, userName } = req.body || {};

    if (!imageBase64) {
      return res.status(400).json({ message: 'imageBase64 is required' });
    }
    if (!key) {
      return res.status(400).json({ message: 'check key is required' });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    let unit = unitId ? report.units.id(unitId) : null;
    if (!unit && report.units?.length) {
      unit = report.units[0];
    }
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    const match = String(imageBase64).match(/^data:(.+);base64,(.+)$/);
    const base64Data = match ? match[2] : String(imageBase64);
    const mime = match?.[1] || 'image/jpeg';
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : 'jpg';

    if (!base64Data || base64Data.length < 32) {
      return res.status(400).json({ message: 'Invalid image data' });
    }

    const saved = saveChecklistPhoto({
      reportId: report._id.toString(),
      unitId: unit._id.toString(),
      key,
      base64Data,
      ext,
    });

    const checklist = checklistToObject(unit.checklist);
    checklist[key] = {
      ...(checklist[key] || {}),
      photoUrl: saved.photoUrl,
      photoPath: saved.filePath,
      status: checklist[key]?.status || 'Good',
    };
    unit.checklist = checklist;
    addContributor(report, userId, userName);
    report.markModified('units');
    report.status = 'in_progress';
    await report.save();

    const payload = serializeReport(report);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

function isChecklistComplete(report) {
  if (!report.units?.length) {
    return false;
  }

  for (const unit of report.units) {
    const checklist = checklistToObject(unit.checklist);
    for (const section of CHECKLIST_SECTIONS) {
      for (const item of section.items) {
        const check = checklist[item.key];
        if (!check?.status) {
          return false;
        }
        if (item.requiresPhoto && !check.photoUrl) {
          return false;
        }
      }
    }
  }
  return true;
}

export async function completeReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (!isChecklistComplete(report)) {
      return res.status(400).json({
        message: 'Checklist belum lengkap. Pastikan semua item terisi dan punya foto.',
      });
    }

    const completerName = String(req.body?.checkedBy || '').trim();
    if (!completerName) {
      return res.status(400).json({
        message: 'checkedBy is required (user who completes the report)',
      });
    }

    // Hanya yang benar-benar kerja (upload/edit checklist) masuk Dicek Oleh.
    // User yang hanya buka card / complete tanpa kerja tidak ditambahkan.
    report.checkedBy = buildCheckedByLabel(report);
    report.note = req.body?.note ?? report.note;
    report.leaderSign = req.body?.leaderSign ?? report.leaderSign;
    report.status = 'completed';
    report.completedAt = new Date();
    await report.save();

    const completedAt = report.completedAt;
    const monthStart = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );
    const monthEnd = new Date(
      completedAt.getFullYear(),
      completedAt.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const monthReports = await Report.find({
      status: 'completed',
      completedAt: { $gte: monthStart, $lte: monthEnd },
    }).sort({ completedAt: 1 });

    const baseUrl = getBaseUrl(req);
    const excel = await generateMonthGroupedExcel(
      monthReports,
      baseUrl,
      completedAt,
    );

    await Report.updateMany(
      { _id: { $in: monthReports.map(item => item._id) } },
      {
        $set: {
          excelPath: excel.excelPath,
          excelUrl: excel.excelUrl,
        },
      },
    );

    const fresh = await Report.findById(report._id);
    const payload = serializeReport(fresh);
    const io = req.app.get('io');
    io?.emit('report:completed', payload);
    io?.emit('working:stop', { reportId: report._id.toString() });

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function reopenReport(req, res) {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = 'in_progress';
    report.completedAt = null;
    await report.save();

    const payload = serializeReport(report);
    const io = req.app.get('io');
    io?.emit('report:updated', payload);
    io?.emit('report:reopened', payload);

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getChecklistTemplate(req, res) {
  res.json({
    sections: CHECKLIST_SECTIONS,
  });
}

export { UPLOAD_ROOT };
