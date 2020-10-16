let csrftoken = Cookies.get('csrftoken');
// generic wrapper function for fetch requests
const secureFetch = (url, method, data) => {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: method || "GET",
			body: JSON.stringify(data),
			headers: { "X-CSRFToken": csrftoken },
			credentials: 'same-origin',
		}).then(async response => {
			console.log(response)
			if (response.ok) {
				// All 200 errors will have response === ok
				ReactDOM.unmountComponentAtNode(document.getElementById('error__component'));
				resolve(response);
				return;
			} else if (response.status === 401) {
				// All 401's redirect user to login
				window.location.replace('/login');
				return;
			} else {
				// Deal with other errors from the server / api
				reject(await response.json());
				return;
			}
		}).catch(error => {
			// deal with network errors
			reject({ error });
		});
	});
}

export default secureFetch