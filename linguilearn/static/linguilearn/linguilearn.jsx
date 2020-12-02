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
		currentUser = res;
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







class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'error': '',
			'msg': '',
			'view': 'search',
			'currentUser': currentUser
		}
	};


	render() {
		// let errorHandler = this.handleError;
		return (
			<div className="body">
				<SideBar view = { (view) => this.setState({ view: view }) } listCountSummary={ this.state.currentUser.listCountSummary } userName={ this.state.currentUser.userName }/>
				<div className = "view">
					{ this.state.view === 'search' ? <WordSearch /> : null }
					{ this.state.view === 'library' ? <Library userId = { this.state.currentUser.userId } reloadLibrary = { () => this.loadUser() }/> : null}
				</div>
			</div>
		)
	};

	loadUser = async () => {
		await secureFetch(`v1/users/current`)
		.then(res => {
			currentUser = res;
			this.setState({currentUser: {...res} })
			console.log(this.state.currentUser)
		})
		.catch(error => {
			console.log(error)
			error = error.error;
		});
	}

}

function renderPage() {
	ReactDOM.render(<App />, document.querySelector("#app"));
}




