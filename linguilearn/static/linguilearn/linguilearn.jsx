let csrftoken = Cookies.get('csrftoken');
let currentUser = null;
let view = '';
let sideBarState = "currentUser";



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
	await secureFetch(`v1/users/current`)
	.then(res => {
		console.log(res);
		currentUser = res;
		// renderUserDash(currentUser);
		renderPage();
	})
	.catch(error => {
		console.log(error)
		error = error.error;
	});

};


async function addFriend(userEmail) {
	let res = await secureFetch(`v1/friendship/${userEmail}/add`, 'POST')
	.catch(error => {
		error = error.error;
		console.log(error)
	})
	return res;
};


async function userSearch(qs) {
	let res = await secureFetch(`v1/users?${qs}`, 'GET')
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

};





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




class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'error': '',
			'msg': '',
		}
	};

	render() {
		let errorHandler = this.handleError;
		return (
			<div className="body">
				<SideBar />
				<WordSearch />
			</div>
		)
	};

	handleError = (e) => {
		this.setState({ 'error': e });
	};

}

function renderPage() {
	ReactDOM.render(<App />, document.querySelector("#app"));
}




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
			let result = await secureFetch(`v1/friendship/${username}/add`, 'POST').catch( e => {
				console.log(e);
			})
			console.log(result)

		};

		actionRemoveFriend = async (username) => {
			console.log(username)
			let result = await secureFetch(`v1/friendship/${3}/cancel`, 'POST').catch( e => {
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
	await load_currentUser();

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