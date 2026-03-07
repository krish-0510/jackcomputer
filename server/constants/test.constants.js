const TEST_CENTERS = Object.freeze({
  chandkheda: {
    id: 'chandkheda',
    name: 'Chandkheda',
    address: '109, Rudrax Complex, IOC Road, Chandkheda, Ahmedabad',
    phone: '+91-8866131799',
  },
  kalol: {
    id: 'kalol',
    name: 'Kalol',
    address: 'S-82/83/84 Silver Plaza, Opp Pooja Fast Food, Navjivan Compund Kalol(N.G) 382721',
    phone: '+91-8866131799',
  },
  baroda: {
    id: 'baroda',
    name: 'Baroda',
    address:
      'Darshanam Highview, FF9, Ajwa Rd, Nehru Chacha Nagar, Sayaji Park Society, Vadodara, Gujarat 390019',
    phone: '+91-8866131799',
  },
});

const TEST_CENTER_IDS = Object.freeze(Object.keys(TEST_CENTERS));

const TEST_SUBJECTS = Object.freeze(['CCC', 'Programming', 'Graphic Designing']);

const TEST_SUBJECT_ALIAS_MAP = Object.freeze({
  ccc: 'CCC',
  programming: 'Programming',
  'graphic designing': 'Graphic Designing',
  'graphic desiging': 'Graphic Designing',
});

const TEST_MODES = Object.freeze(['online', 'offline']);

const TEST_FIELD_INPUT_TYPES = Object.freeze(['text', 'textarea', 'number', 'boolean', 'date', 'select']);

const SLOT_TIME_RANGE_REGEX = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/;

module.exports = {
  TEST_CENTERS,
  TEST_CENTER_IDS,
  TEST_SUBJECTS,
  TEST_SUBJECT_ALIAS_MAP,
  TEST_MODES,
  TEST_FIELD_INPUT_TYPES,
  SLOT_TIME_RANGE_REGEX,
};
