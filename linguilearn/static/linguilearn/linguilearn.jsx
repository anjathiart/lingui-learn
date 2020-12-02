// Global state
let csrftoken = Cookies.get('csrftoken');
let currentUser = null;
let view = 'main';
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






class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'error': '',
			'msg': '',
			'view': 'search',
		}
	};

/*	async componentDidMount() {
		// load current user profile
		await secureFetch(`v1/users/current`)
		.then(res => {
			console.log(res);
			currentUser = res;
			// renderUserDash(currentUser);
			// renderPage();
		})
		.catch(error => {
			console.log(error)
			error = error.error;
		});

	}*/

	render() {
		// let errorHandler = this.handleError;
		return (
			<div className="body">
				<SideBar view = { (view) => this.setState({ view: view }) } />
				<div className = "view">
					{ this.state.view === 'search' ? <WordSearch /> : null }
					{ this.state.view === 'library' ? <Library userId = { currentUser.userId }/> : null}
				</div>
			</div>
		)
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
			}
		}

		render() {
			return (
				<div className="userSearchResultCard">
					<p>Username: { this.props.user.name }</p>
				</div>
			)
		};

	}

}


