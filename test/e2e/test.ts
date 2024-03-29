import { expect, test } from '@playwright/test';
import { arrayify } from '../../src/lib/utils';

test('test:hello world', async ({ request }) => {
	const res = await request.get('/api/test');
	expect([...(await res.body())]).toEqual(arrayify('hello world'));
});

test('cache request', () => {
	// todo
});

test('upload file', () => {
	// todo
});
