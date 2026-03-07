const {
  TEST_CENTER_IDS,
  TEST_SUBJECT_ALIAS_MAP,
  TEST_MODES,
  TEST_FIELD_INPUT_TYPES,
  SLOT_TIME_RANGE_REGEX,
} = require('../constants/test.constants');

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const DD_MM_YYYY_REGEX = /^(\d{2})-(\d{2})-(\d{4})$/;

const normalizeString = (value) => (typeof value === 'string' ? value.trim() : '');

const parseIsoDateToUtcDate = (dateInput) => {
  const normalizedDate = normalizeString(dateInput);

  if (!ISO_DATE_REGEX.test(normalizedDate)) {
    return null;
  }

  const [year, month, day] = normalizedDate.split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const normalizeFlexibleDobToIsoDate = (dobInput) => {
  const normalizedDob = normalizeString(dobInput);

  if (ISO_DATE_REGEX.test(normalizedDob)) {
    return parseIsoDateToUtcDate(normalizedDob) ? normalizedDob : '';
  }

  const match = normalizedDob.match(DD_MM_YYYY_REGEX);

  if (!match) {
    return '';
  }

  const day = match[1];
  const month = match[2];
  const year = match[3];
  const isoDate = `${year}-${month}-${day}`;

  return parseIsoDateToUtcDate(isoDate) ? isoDate : '';
};

const normalizeCenter = (centerInput) => {
  const normalizedCenter = normalizeString(centerInput).toLowerCase();

  if (!normalizedCenter) {
    return null;
  }

  return TEST_CENTER_IDS.includes(normalizedCenter) ? normalizedCenter : null;
};

const normalizeCenterList = (centersInput, { required = true } = {}) => {
  if (!Array.isArray(centersInput)) {
    if (!required && centersInput === undefined) {
      return { value: undefined };
    }

    return { error: 'centers must be an array' };
  }

  const normalized = [];

  for (const center of centersInput) {
    const normalizedCenter = normalizeCenter(center);

    if (!normalizedCenter) {
      return { error: `Invalid center: ${String(center)}` };
    }

    if (!normalized.includes(normalizedCenter)) {
      normalized.push(normalizedCenter);
    }
  }

  if (required && normalized.length === 0) {
    return { error: 'centers must contain at least one valid center' };
  }

  return { value: normalized };
};

const normalizeSubject = (subjectInput) => {
  const normalizedSubjectKey = normalizeString(subjectInput).toLowerCase();

  if (!normalizedSubjectKey) {
    return null;
  }

  return TEST_SUBJECT_ALIAS_MAP[normalizedSubjectKey] || null;
};

const normalizeSubjectList = (subjectsInput, { required = true } = {}) => {
  if (!Array.isArray(subjectsInput)) {
    if (!required && subjectsInput === undefined) {
      return { value: undefined };
    }

    return { error: 'subjects must be an array' };
  }

  const normalized = [];

  for (const subject of subjectsInput) {
    const normalizedSubject = normalizeSubject(subject);

    if (!normalizedSubject) {
      return { error: `Invalid subject: ${String(subject)}` };
    }

    if (!normalized.includes(normalizedSubject)) {
      normalized.push(normalizedSubject);
    }
  }

  if (required && normalized.length === 0) {
    return { error: 'subjects must contain at least one valid subject' };
  }

  return { value: normalized };
};

const normalizeMode = (modeInput) => {
  if (modeInput === undefined) {
    return { value: undefined };
  }

  if (modeInput === null || modeInput === '') {
    return { value: null };
  }

  const normalizedMode = normalizeString(modeInput).toLowerCase();

  if (!TEST_MODES.includes(normalizedMode)) {
    return { error: 'mode must be one of: online, offline' };
  }

  return { value: normalizedMode };
};

const parseIntegerAmount = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalizedValue = typeof value === 'string' ? Number(value.trim()) : value;

  if (!Number.isInteger(normalizedValue)) {
    return null;
  }

  return normalizedValue;
};

const normalizePrizes = (prizesInput) => {
  if (prizesInput === undefined) {
    return { value: undefined };
  }

  if (prizesInput === null) {
    return { value: null };
  }

  if (typeof prizesInput !== 'object' || Array.isArray(prizesInput)) {
    return { error: 'prizes must be an object' };
  }

  const normalizedPrizes = {};
  const allowedKeys = ['firstPlace', 'secondPlace', 'thirdPlace', 'special'];

  for (const key of allowedKeys) {
    if (!(key in prizesInput)) {
      continue;
    }

    const parsedAmount = parseIntegerAmount(prizesInput[key]);

    if (parsedAmount === null || parsedAmount < 0) {
      return { error: `${key} must be a non-negative integer` };
    }

    normalizedPrizes[key] = parsedAmount;
  }

  return {
    value: Object.keys(normalizedPrizes).length > 0 ? normalizedPrizes : null,
  };
};

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  return null;
};

const resolveFeeFields = ({ bodyHasFee, bodyFee, existingHasFee, existingFee, isCreate = false }) => {
  const normalizedHasFee =
    bodyHasFee === undefined
      ? isCreate
        ? false
        : existingHasFee
      : normalizeBoolean(bodyHasFee);

  if (normalizedHasFee === null) {
    return { error: 'hasFee must be true or false' };
  }

  if (!normalizedHasFee) {
    return {
      hasFee: false,
      fee: 0,
    };
  }

  if (bodyFee === undefined) {
    if (!isCreate && existingHasFee && Number.isInteger(existingFee) && existingFee > 0) {
      return {
        hasFee: true,
        fee: existingFee,
      };
    }

    return { error: 'fee is required when hasFee is true' };
  }

  const normalizedFee = parseIntegerAmount(bodyFee);

  if (normalizedFee === null || normalizedFee <= 0) {
    return { error: 'fee must be a positive integer when hasFee is true' };
  }

  return {
    hasFee: true,
    fee: normalizedFee,
  };
};

const normalizeSlotRange = (slotInput) => {
  if (slotInput === undefined || slotInput === null || slotInput === '') {
    return { value: null };
  }

  if (typeof slotInput !== 'string') {
    return { error: 'slot must be a string in HH:mm-HH:mm format' };
  }

  const normalizedSlot = slotInput.trim();

  if (!SLOT_TIME_RANGE_REGEX.test(normalizedSlot)) {
    return { error: 'slot must be in HH:mm-HH:mm format' };
  }

  const [startTime, endTime] = normalizedSlot.split('-');

  if (startTime >= endTime) {
    return { error: 'slot start time must be before end time' };
  }

  return { value: normalizedSlot };
};

const normalizeFieldKey = (keyInput) => {
  const key = normalizeString(keyInput).toLowerCase();

  if (!/^[a-z][a-z0-9_]{1,49}$/.test(key)) {
    return null;
  }

  return key;
};

const normalizeFieldInputType = (inputType) => {
  const normalizedType = normalizeString(inputType).toLowerCase();

  if (!TEST_FIELD_INPUT_TYPES.includes(normalizedType)) {
    return null;
  }

  return normalizedType;
};

const formatDateToIso = (dateValue) => {
  if (!dateValue) {
    return null;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
};

module.exports = {
  ISO_DATE_REGEX,
  normalizeString,
  parseIsoDateToUtcDate,
  normalizeFlexibleDobToIsoDate,
  normalizeCenter,
  normalizeCenterList,
  normalizeSubject,
  normalizeSubjectList,
  normalizeMode,
  normalizePrizes,
  normalizeBoolean,
  resolveFeeFields,
  normalizeSlotRange,
  normalizeFieldKey,
  normalizeFieldInputType,
  formatDateToIso,
};
