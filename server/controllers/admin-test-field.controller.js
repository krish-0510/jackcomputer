const TestFieldTemplate = require('../models/test-field-template.model');

const { normalizeBoolean, normalizeFieldInputType, normalizeFieldKey, normalizeString } = require('../utils/test.utils');

const sanitizeTemplate = (template) => ({
  id: template._id,
  key: template.key,
  label: template.label,
  inputType: template.inputType,
  requiredByDefault: template.requiredByDefault,
  active: template.active,
  createdBy: template.createdBy,
  createdAt: template.createdAt,
  updatedAt: template.updatedAt,
});

const createTestFieldTemplate = async (req, res, next) => {
  try {
    const { key, label, inputType, requiredByDefault, active } = req.body;

    if (!key || !label || !inputType) {
      return res.status(400).json({
        message: 'key, label, and inputType are required',
      });
    }

    const normalizedKey = normalizeFieldKey(key);

    if (!normalizedKey) {
      return res.status(400).json({ message: 'key must match /^[a-z][a-z0-9_]{1,49}$/' });
    }

    const normalizedLabel = normalizeString(label);

    if (!normalizedLabel) {
      return res.status(400).json({ message: 'label is required' });
    }

    const normalizedInputType = normalizeFieldInputType(inputType);

    if (!normalizedInputType) {
      return res.status(400).json({ message: 'inputType is invalid' });
    }

    const normalizedRequiredByDefault =
      requiredByDefault === undefined ? false : normalizeBoolean(requiredByDefault);

    if (normalizedRequiredByDefault === null) {
      return res.status(400).json({ message: 'requiredByDefault must be true or false' });
    }

    const normalizedActive = active === undefined ? true : normalizeBoolean(active);

    if (normalizedActive === null) {
      return res.status(400).json({ message: 'active must be true or false' });
    }

    const template = await TestFieldTemplate.create({
      key: normalizedKey,
      label: normalizedLabel,
      inputType: normalizedInputType,
      requiredByDefault: normalizedRequiredByDefault,
      active: normalizedActive,
      createdBy: req.auth?.phone || 'admin',
    });

    return res.status(201).json({
      success: true,
      data: sanitizeTemplate(template),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A test field template with this key already exists' });
    }

    return next(error);
  }
};

const getAllTestFieldTemplates = async (req, res, next) => {
  try {
    const { active } = req.query;
    const query = {};

    if (active !== undefined) {
      const normalizedActive = normalizeBoolean(active);

      if (normalizedActive === null) {
        return res.status(400).json({ message: 'active must be true or false' });
      }

      query.active = normalizedActive;
    }

    const templates = await TestFieldTemplate.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      data: templates.map(sanitizeTemplate),
    });
  } catch (error) {
    return next(error);
  }
};

const getTestFieldTemplateById = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const template = await TestFieldTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Test field template not found' });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeTemplate(template),
    });
  } catch (error) {
    return next(error);
  }
};

const updateTestFieldTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const updates = {};

    if (req.body.key !== undefined) {
      const normalizedKey = normalizeFieldKey(req.body.key);

      if (!normalizedKey) {
        return res.status(400).json({ message: 'key must match /^[a-z][a-z0-9_]{1,49}$/' });
      }

      updates.key = normalizedKey;
    }

    if (req.body.label !== undefined) {
      const normalizedLabel = normalizeString(req.body.label);

      if (!normalizedLabel) {
        return res.status(400).json({ message: 'label cannot be empty' });
      }

      updates.label = normalizedLabel;
    }

    if (req.body.inputType !== undefined) {
      const normalizedInputType = normalizeFieldInputType(req.body.inputType);

      if (!normalizedInputType) {
        return res.status(400).json({ message: 'inputType is invalid' });
      }

      updates.inputType = normalizedInputType;
    }

    if (req.body.requiredByDefault !== undefined) {
      const normalizedRequiredByDefault = normalizeBoolean(req.body.requiredByDefault);

      if (normalizedRequiredByDefault === null) {
        return res.status(400).json({ message: 'requiredByDefault must be true or false' });
      }

      updates.requiredByDefault = normalizedRequiredByDefault;
    }

    if (req.body.active !== undefined) {
      const normalizedActive = normalizeBoolean(req.body.active);

      if (normalizedActive === null) {
        return res.status(400).json({ message: 'active must be true or false' });
      }

      updates.active = normalizedActive;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const template = await TestFieldTemplate.findByIdAndUpdate(templateId, updates, {
      new: true,
      runValidators: true,
    });

    if (!template) {
      return res.status(404).json({ message: 'Test field template not found' });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeTemplate(template),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'A test field template with this key already exists' });
    }

    return next(error);
  }
};

const deleteTestFieldTemplate = async (req, res, next) => {
  try {
    const { templateId } = req.params;
    const template = await TestFieldTemplate.findByIdAndDelete(templateId);

    if (!template) {
      return res.status(404).json({ message: 'Test field template not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Test field template deleted',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTestFieldTemplate,
  getAllTestFieldTemplates,
  getTestFieldTemplateById,
  updateTestFieldTemplate,
  deleteTestFieldTemplate,
};
