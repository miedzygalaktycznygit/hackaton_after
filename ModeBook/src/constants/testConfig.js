
//export const TEST_DATE = null;
export const TEST_DATE = new Date('2026-06-13T12:00:00');

export function getActiveDate() {
  return TEST_DATE ? new Date(TEST_DATE) : new Date();
}

export const API_BASE = 'http://10.0.2.2:3000';

export const USER_ID = 1;

