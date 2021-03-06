// generic wrapper function for fetch requests
const secureFetch = (url, method, data) => {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: method || "GET",
			body: JSON.stringify(data),
			headers: { "X-CSRFToken": csrftoken },
			credentials: 'same-origin',
		}).then(async (response) => {
			if (response.ok) {
				// All 200 errors will have response === ok
				resolve(await response.json());
				return;
			} else if (response.status === 401) {
				// All 401's redirect user to login
				window.location.replace('/login');
				return;
			} else {
				console.log({response})
				reject({ ... await response.json(), status: response.status});
				return;
			}
		}).catch(error => {
			// deal with network errors
			console.log({error})
			reject({ error });
		});
	});
} 