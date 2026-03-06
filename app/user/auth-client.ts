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
const E164_PHONE_REGEX = /^\+[1-9]\d{1,14}$/;
const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

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
