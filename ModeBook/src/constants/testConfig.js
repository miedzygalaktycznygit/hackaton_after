
//export const TEST_DATE = null;
export const TEST_DATE = new Date('2026-05-24T12:00:00');

export function getActiveDate() {
  return TEST_DATE ? new Date(TEST_DATE) : new Date();
}

export const API_BASE = 'http://10.5.5.152:3000';

export const USER_ID = 1;

