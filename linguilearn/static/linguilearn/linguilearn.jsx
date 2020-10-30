let csrftoken = Cookies.get('csrftoken');

// generic wrapper function for fetch requests
const secureFetch = (url, method, data) => {
	return new Promise((resolve, reject) => {
		fetch(url, {
			method: method || "GET",
			body: JSON.stringify(data),
			headers: { "X-CSRFToken": csrftoken },
			credentials: 'same-origin',
		}).then(response => {
			if (response.ok) {
				// All 200 errors will have response === ok
				ReactDOM.unmountComponentAtNode(document.getElementById('error__component'));
				resolve(response.json());
				return;
			} else if (response.status === 401) {
				// All 401's redirect user to login
				window.location.replace('/login');
				return;
			} else {
				// Deal with other errors from the server / api
				reject(response.json());
				return;
			}
		}).catch(error => {
			// deal with network errors
			reject({ error });
		});
	});
} 

// initialise the page
if (document.readyState !== 'loading' ) {
	console.log( 'document is already ready, just execute code here' );
	myInitCode();
} else {
	document.addEventListener('DOMContentLoaded', function () {
		console.log( 'document was not ready, place code here' );
		myInitCode();
	});
}

// All code that needs to load once the DOM is ready
function myInitCode() {
	document.querySelector('#searchForUserButton').addEventListener('click', async (e) => {
		const usernameOrEmail = document.querySelector('#searchForUserInput').value;
		let result = await userSearch(usernameOrEmail)
		

	})
}

async function userSearch(search) {
	let res = await secureFetch(`api/users?search=${search}`, 'GET')
	.catch(error => {
		// do something with error
		console.log(error)
	})
	return res
}


// 	document.querySelector('#submitRequest').addEventListener('click', () => {
// 		let username = document.querySelector('#requestUsername').value;
// 		secureFetch(`friendship/${username}/add`, 'POST')
// 		.then(response => {
// 			return response.json()
// 		})
// 		.then(result => {
// 			console.log(result)
// 		})
// 		.catch(error => {
// 			console.log(error)
// 		})
// 	})

// 	document.querySelector('#cancelRequest').addEventListener('click', () => {
// 		let username = document.querySelector('#requestUsername').value;
// 		secureFetch(`friendship/1/cancel`, 'POST')
// 		.then(response => {
// 			return response.json()
// 		})
// 		.then(result => {
// 			console.log(result)
// 		})
// 		.catch(error => {
// 			console.log(error)
// 		})
// 	})



	/*feather.replace();

	// load user
	await load_current_user();

	// Handle routing to the following page
	if (currentUser) {
		document.querySelector('#nav__following').addEventListener('click', async () => {
			ReactDOM.unmountComponentAtNode(document.getElementById('profile__component'));
			document.querySelector('#profile__component').style.display = 'none';
			viewQuery = `following=${true}`;
			load_posts();
			contextHeading = "People you follow"

		});
		document.querySelector(".newPost__submit").addEventListener('click', () => {
			secureFetch(`posts`, 'POST', { body: document.querySelector(".newPost__input").value })
			.then(response => {
				document.querySelector(".newPost__input"). value = "";
				load_posts();
			})
			.catch(error => { render_error(error.error); });
		});
		document.querySelector("#profileLink").addEventListener('click', () => {
			render_profile(currentUser);
		});

	}
	load_posts();*/
// }