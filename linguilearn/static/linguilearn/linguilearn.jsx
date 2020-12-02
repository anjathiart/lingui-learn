// Global state
let csrftoken = Cookies.get('csrftoken');


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
	// load current user profile and mount app
	await secureFetch(`v1/users/current`)
	.then(res => {
		renderPage(res);
	})
	.catch(error => {
		console.log({error})
		error = error.error;
	});

};

function renderPage(currentUser) {

	class App extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				'error': '',
				'msg': '',
				'view': 'search',
				'currentUser': currentUser,
				'listFilter': 'all',
			}
		};


		render() {
			return (
				<div className="body">
					<SideBar
						view = { (view) => this.setState({ view: view }) }
						filterLibrary = { (filter) => this.setState({ "listFilter": filter}) }
						listCountSummary={ this.state.currentUser.listCountSummary }
						userName={ this.state.currentUser.userName }

					/>
					<div className = "view">
						{ this.state.view === 'search' ? <WordSearch /> : null }
						{ this.state.view === 'library'
							? <Library
								key={ this.state.listFilter }
								userId = { this.state.currentUser.userId }
								listFilter={ this.state.listFilter }
								reloadLibrary = { () => this.loadUser() }
							 />
							: null }
					</div>
				</div>
			)
		};

		loadUser = async () => {
			await secureFetch(`v1/users/current`)
			.then(res => {
				currentUser = res;
				this.setState({currentUser: {...res} })
			})
			.catch(error => {
				console.log({error})
				error = error.error;
			});
		}
	}

	ReactDOM.render(<App />, document.querySelector("#app"));
}




