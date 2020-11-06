let csrftoken = Cookies.get('csrftoken');
let current_user = null;
let view = '';
let sideBarState = "currentUser";
let error = '';
let msg = '';


const setError = (msg) => {
	error = msg;
	// TODO: remount <App />
};

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
				resolve( await response.json());
				return;
			} else if (response.status === 401) {
				// All 401's redirect user to login
				window.location.replace('/login');
				return;
			} else {
				console.log(response)
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
async function myInitCode() {
	view = "main"
	// load current user profile
	await secureFetch(`api/users/current`)
	.then(res => {
		console.log(res);
		current_user = res;
		// renderUserDash(current_user);
		renderPage();
	})
	.catch(error => {
		console.log(error)
		error = error.error;
	});

};


async function addFriend(userEmail) {
	let res = await secureFetch(`api/friendship/${userEmail}/add`, 'POST')
	.catch(error => {
		error = error.error;
		console.log(error)
	})
	return res;
};


async function userSearch(qs) {
	let res = await secureFetch(`api/users?${qs}`, 'GET')
	.catch(error => {
		// do something with error
		console.log(error)
	})
	return res
};

	
function renderUserDash() {
	// TODO: deal with case where current user is null
	// TODO: refactor to show all user profiles with same kind of vibe?


	class UserDash extends React.component {

		render() {
			return (
				<div>
				</div>

			);

		}
	}

}


class AddFriend extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'friendStatus': '',
			'toUserEmail': '',

		}
	};

	render() {
		return (
			<div>
				<input type="text" placeholder="user email address"  value={ this.state.toUserEmail } onChange={ this.handleInput.bind(this) } />
				<button onClick={ this.actionAddFriend.bind(this) } >Search</button>
			</div>

		)
	};

	handleInput = (e) => {
		this.setState({ toUserEmail: e.target.value });
	};

	actionAddFriend = async () => {
		await secureFetch(`api/friendship/${this.state.toUserEmail}/add`, 'POST')
		.then(res => {

		})
		.catch(error => {
			msg = error.error;
			console.log(msg)
			this.props.onError(msg)
		})
	}

}


// class User extends React.Component {
// 	// constructor(props) {
// 	// 	super(props);
// 	// 	this.state = {
// 	// 		'friendStatus': '',

// 	// 	}
// 	// };

// 	render() {
// 		return (
// 			<div className="userSearchResultCard">
// 				<p>Username: Test User</p>
// 				<button>Add friend</button>
// 				<button>Remove friend</button>
// 			</div>
// 		)
// 	};

// };

class Error extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal__content">
					<p>{ this.props.msg }</p>
					<button onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
				</div>
			</div>
		);
	}
};

class Message extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal__content">
					<p>{ this.props.msg }</p>
					<button onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
				</div>
			</div>
		);
	}
};


class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'state': sideBarState,
			'error': '',
			'msg': '',
		}
	};

	render() {
		let errorHandler = this.handleError;
		return (
			<div>
				{ this.state.error && <Error msg={ this.state.error } onClose={ () => this.setState({ 'error': '' }) } /> }
				{ this.state.msg && <Message msg={ this.state.msg } onClose={ () => this.setState({ 'msg': '' }) } /> }
				<AddFriend onError={ this.handleError.bind(this) } /> 
			</div>
		)
	};

	handleError = (e) => {
		console.log('hi')
		console.log(e)
		this.setState({ 'error': e });
	};

}

function renderPage() {
	console.log('hi')
	ReactDOM.render(<App />, document.querySelector("#app"));
}




function renderSuccessMessage(msg) {
	console.log(msg)
	class Message extends React.Component {
		render() {
			return (
				<div className="modal">
					<div className="modal__content">
						<p>{ msg }</p>
						<button onClick={ this.close } className="btn btn-primary btn-lg">OK</button>
					</div>
				</div>
			);
		}
		close = () => {
			ReactDOM.unmountComponentAtNode(document.getElementById('message__compoonent'));
		}
	}
	// ReactDOM.render(<Message />, document.querySelector("#message__component"));
};

function renderErrorMessage(msg) {
	console.log(msg)
	class Error extends React.Component {
		render() {
			return (
				<div className="modal">
					<div className="modal__content">
						<p>{ msg }</p>
						<button onClick={ this.close } className="btn btn-primary btn-lg">OK</button>
					</div>
				</div>
			);
		}
		close = () => {
			ReactDOM.unmountComponentAtNode(document.getElementById('message__component'));
		}
	}
	// ReactDOM.render(<Error />, document.querySelector("#message__component"));
};



function renderUserList(user) {



	class User extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				friendStatus: '',
			}
		}

		render() {
			return (
				<div className="userSearchResultCard">
					<p>Username: { this.props.user.name }</p>
					<button onClick={ this.actionAddFriend.bind(this, this.props.user.name) }>Add friend</button>
					<button onClick={ this.actionRemoveFriend.bind(this, this.props.user.name) }>Remove friend</button>
				</div>
			)
		};

		actionAddFriend = async (username) => {
			console.log(username)
			let result = await secureFetch(`api/friendship/${username}/add`, 'POST').catch( e => {
				console.log(e);
			})
			console.log(result)

		};

		actionRemoveFriend = async (username) => {
			console.log(username)
			let result = await secureFetch(`api/friendship/${3}/cancel`, 'POST').catch( e => {
				console.log(e);
			})
			console.log(result)

		};

	}


	// ReactDOM.render(<User />, document.querySelector("#userSearchList__component"));


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