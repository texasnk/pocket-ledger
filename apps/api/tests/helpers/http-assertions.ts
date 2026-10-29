import assert from 'node:assert/strict';
import type { Response } from 'supertest';

export function assertJsonResponse(response: Response, expectedStatus: number): void {
  assert.equal(response.status, expectedStatus);
  assert.match(response.headers['content-type'] ?? '', /^application\/json/);
}

export function assertPublicError(
  response: Response,
  expectedStatus: number,
  expectedMessage: string
): void {
  assertJsonResponse(response, expectedStatus);
  assert.deepEqual(response.body, { message: expectedMessage });
}

export function assertSafeInternalError(response: Response): void {
  assertPublicError(response, 500, 'Internal server error.');
  const publicMessage = response.body.message as string;
  assert.doesNotMatch(publicMessage, /sqlite|sql|database|table|query|path|stack/i);
}
