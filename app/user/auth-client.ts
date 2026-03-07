export type Gender = "male" | "female" | "other";

export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: Gender;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface AdminProfile {
  phone: string;
  dob: string;
}

export interface AdminSession {
  token: string;
  role: "admin";
  admin: AdminProfile;
}

export interface TestPrize {
  firstPlace?: number;
  secondPlace?: number;
  thirdPlace?: number;
  special?: number;
}

export interface TestCustomField {
  key: string;
  label: string;
  inputType: string;
  required: boolean;
  value?: any;
}

export interface Test {
  id: string;
  name: string;
  date: string;
  duration: number; // in minutes
  status: "upcoming" | "active" | "completed";

  centers: string[];
  subjects: string[];
  prizes?: TestPrize;
  hasFee: boolean;
  fee: number;
  mode: string;
  testRules?: string;
  testDescription?: string;
  isRegistrationOpen: boolean;
  customFields?: TestCustomField[];
}

export interface TestRegistration {
  testId: string;
  userPhone: string;
  userEmail: string;
}

interface RegisterInput {
  name: string;
  phone: string;
  email: string;
  dob: string;
  gender: Gender;
}

interface LoginInput {
  phone: string;
  dob: string;
}

const USERS_KEY = "jackcomputer_users";
const SESSION_KEY = "jackcomputer_session";
const ADMIN_SESSION_KEY = "jackcomputer_admin_session";
const TESTS_KEY = "jackcomputer_tests";
const REGISTRATIONS_KEY = "jackcomputer_registrations";
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ADMIN_DOB_REGEX = /^\d{2}-\d{2}-\d{4}$/;

const canUseStorage = () => typeof window !== "undefined";

const readJson = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = <T>(key: string, value: T): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizePhone = (phone: string) => phone.trim();
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeDob = (dob: string) => dob.trim();

const createToken = () => `jc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

const readUsers = () => readJson<UserProfile[]>(USERS_KEY, []);
const writeUsers = (users: UserProfile[]) => writeJson(USERS_KEY, users);

const createSession = (user: UserProfile): AuthSession => ({
  token: createToken(),
  user,
});

const validateDob = (dob: string) => {
  if (!DOB_REGEX.test(dob)) {
    return false;
  }

  const parsedDate = new Date(`${dob}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === dob;
};

const normalizeDobForCompare = (dob: string): string => {
  const normalizedDob = normalizeDob(dob);

  if (validateDob(normalizedDob)) {
    return normalizedDob;
  }

  if (!ADMIN_DOB_REGEX.test(normalizedDob)) {
    return "";
  }

  const [day, month, year] = normalizedDob.split("-");
  const parsedDob = `${year}-${month}-${day}`;

  return validateDob(parsedDob) ? parsedDob : "";
};

const resolveAdminCredentials = (): AdminProfile | null => {
  const adminPhone = normalizePhone(process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER ?? "");
  const adminDob = normalizeDobForCompare(process.env.NEXT_PUBLIC_ADMIN_DOB ?? "");

  if (!adminPhone || !adminDob) {
    return null;
  }

  return {
    phone: adminPhone,
    dob: adminDob,
  };
};

const createAdminSession = (admin: AdminProfile): AdminSession => ({
  token: createToken(),
  role: "admin",
  admin,
});

export const registerUser = (input: RegisterInput): AuthSession => {
  const name = input.name.trim();
  const phone = normalizePhone(input.phone);
  const email = normalizeEmail(input.email);
  const dob = normalizeDob(input.dob);
  const gender = input.gender.trim().toLowerCase() as Gender;

  if (!name || !phone || !email || !dob || !gender) {
    throw new Error("name, phone, email, dob, and gender are required");
  }

  if (!E164_PHONE_REGEX.test(phone)) {
    throw new Error("phone must be in valid E.164 format, e.g. +911234567890");
  }

  if (!validateDob(dob)) {
    throw new Error("dob must be a valid date");
  }

  if (!["male", "female", "other"].includes(gender)) {
    throw new Error("gender must be male, female, or other");
  }

  const existingUsers = readUsers();
  const conflict = existingUsers.find((user) => user.phone === phone || user.email === email);

  if (conflict) {
    throw new Error(conflict.phone === phone ? "A user with this phone already exists" : "A user with this email already exists");
  }

  const user: UserProfile = {
    name,
    phone,
    email,
    dob,
    gender,
  };

  writeUsers([...existingUsers, user]);

  const session = createSession(user);
  writeJson(SESSION_KEY, session);

  return session;
};

export const loginUser = (input: LoginInput): AuthSession => {
  const phone = normalizePhone(input.phone);
  const dob = normalizeDob(input.dob);

  if (!phone || !dob) {
    throw new Error("phone and dob are required");
  }

  if (!E164_PHONE_REGEX.test(phone)) {
    throw new Error("phone must be in valid E.164 format, e.g. +911234567890");
  }

  if (!validateDob(dob)) {
    throw new Error("dob must be a valid date");
  }

  const user = readUsers().find((profile) => profile.phone === phone && profile.dob === dob);

  if (!user) {
    throw new Error("Invalid phone or dob");
  }

  const session = createSession(user);
  writeJson(SESSION_KEY, session);

  return session;
};

export const loginAdmin = (input: LoginInput): AdminSession => {
  const phone = normalizePhone(input.phone);
  const dob = normalizeDobForCompare(input.dob);

  if (!phone || !dob) {
    throw new Error("phone and dob are required");
  }

  const adminCredentials = resolveAdminCredentials();

  if (!adminCredentials) {
    throw new Error("Admin credentials are not configured");
  }

  if (phone !== adminCredentials.phone || dob !== adminCredentials.dob) {
    throw new Error("Invalid admin phone or dob");
  }

  const session = createAdminSession(adminCredentials);
  writeJson(ADMIN_SESSION_KEY, session);

  return session;
};

export const getAdminSession = (): AdminSession | null => {
  const session = readJson<AdminSession | null>(ADMIN_SESSION_KEY, null);

  if (!session || typeof session.token !== "string" || session.role !== "admin" || !session.admin) {
    return null;
  }

  return session;
};

export const clearAdminSession = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const getAllStudents = (): UserProfile[] => readUsers();

export const getSession = (): AuthSession | null => {
  const session = readJson<AuthSession | null>(SESSION_KEY, null);

  if (!session || typeof session.token !== "string" || !session.user) {
    return null;
  }

  return session;
};

export const clearSession = (): void => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
};

export const formatDobForDisplay = (dob: string): string => {
  const [year, month, day] = dob.split("-");

  if (!year || !month || !day) {
    return dob;
  }

  return `${day}-${month}-${year}`;
};

export const getTests = (): Test[] => readJson<Test[]>(TESTS_KEY, []);
export const saveTests = (tests: Test[]) => writeJson(TESTS_KEY, tests);

export const getRegistrations = (): TestRegistration[] => readJson<TestRegistration[]>(REGISTRATIONS_KEY, []);
export const saveRegistrations = (registrations: TestRegistration[]) => writeJson(REGISTRATIONS_KEY, registrations);

export const createTest = (input: Omit<Test, "id">): Test => {
  const tests = getTests();
  const newTest: Test = {
    ...input,
    id: `test_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
  };
  saveTests([...tests, newTest]);
  return newTest;
};

export const updateTest = (id: string, updates: Partial<Omit<Test, "id">>): Test => {
  const tests = getTests();
  const testIndex = tests.findIndex((t) => t.id === id);
  if (testIndex === -1) throw new Error("Test not found");

  const updatedTest = { ...tests[testIndex], ...updates };
  tests[testIndex] = updatedTest;
  saveTests(tests);
  return updatedTest;
};

export const deleteTest = (id: string): void => {
  const tests = getTests();
  saveTests(tests.filter((t) => t.id !== id));

  const registrations = getRegistrations();
  saveRegistrations(registrations.filter((r) => r.testId !== id));
};

export const registerForTest = (testId: string, userPhone: string, userEmail: string): void => {
  const registrations = getRegistrations();
  if (registrations.some((r) => r.testId === testId && (r.userPhone === userPhone || r.userEmail === userEmail))) {
    throw new Error("User already registered for this test");
  }
  saveRegistrations([...registrations, { testId, userPhone, userEmail }]);
};

export const unregisterFromTest = (testId: string, userPhone: string): void => {
  const registrations = getRegistrations();
  saveRegistrations(registrations.filter((r) => !(r.testId === testId && r.userPhone === userPhone)));
};
