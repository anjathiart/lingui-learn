// Global state
let csrftoken = Cookies.get('csrftoken');


// initialise the page
// if (document.readyState !== 'loading' ) {
// 	console.log( 'document is already ready, just execute code here' );
// 	myInitCode();
// } else {
// 	document.addEventListener('DOMContentLoaded', function () {
// 		console.log( 'document was not ready, place code here' );
// 		myInitCode();
// 	});
// }

// // All code that needs to load once the DOM is ready
// async function myInitCode() {
// 	// load current user profile and mount app
const start = async () =>{

	await secureFetch(`v1/users/current`)
	.then(res => {
		renderPage(res);
	})
	.catch(error => {
		console.log({error})
		error = error.error;
	});


}

start();
// };

function renderPage(currentUser) {
	console.log('why rerendering?')
	class App extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				'error': '',
				'msg': '',
				'view': 'search',
				'currentUser': currentUser,
				'listFilter': 'all',
				'entryId': ''
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
								showEntry = { (event) => this.loadEntry(event) }
								selectEntry = { (entryId) => this.loadEntry(entryId) }
							 />
							: null }
						{ this.state.view == 'entry'
							? <LibraryEntry 
								entry={ this.state.entry }
								update={ (event) => this.loadEntry(event) && this.setState({ view: 'entry' })}
								delete={ () => this.loadUser() && this.setState({ view: 'library' }) }
								key={ this.state.entry.id }
							/> : null }
					</div>
				</div>
			)
		};

		loadEntry = async (entryId) => {
			console.log({entryId});
			await secureFetch(`v1/entries/${entryId}`).then(result => {
				console.log({result})
				console.log(result.data)
				this.setState({ entry: result.data })
				this.setState({ view: 'entry' })
			}).catch(error => {
				console.log({ error });
			})
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

		/*actionFetchLibrary = async () => {
			await secureFetch(`v1/users/${this.props.userId}/library?filter=${this.props.listFilter}`).then(result => {
				this.props.reloadLibrary();
				this.setState({ list: result.data.list });
			}).catch(error => {
				console.log({error})
			})
		}*/
	}

	ReactDOM.render(<App />, document.querySelector("#app"));
}




