import { type Writable, writable } from 'svelte/store';
import { api } from '$lib/req';
import type { FetchResult } from '../ambient';

export const submitHelper = (after?: () => void): [(e: Event) => void, Writable<FetchResult>] => {
	const o = {
		pending: 0,
		data: undefined,
		error: undefined
	};
	const result = writable<FetchResult>(o);
	return [
		function (e) {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			const data = new FormData(form);
			const action = form.getAttribute('action');
			if (!action) return;
			const target = api(action);
			const query = target[form.method as keyof typeof target];
			if (query) {
				result.set({ ...o, pending: 1 });
				query(data)
					.success((r) => {
						result.set({ ...o, data: r });
					})
					.fail((reason) => {
						result.set({ ...o, error: reason });
					})
					.finally(after);
			}
		},
		result
	];
};
