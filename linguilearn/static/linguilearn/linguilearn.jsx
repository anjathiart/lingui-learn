// Global state
let csrftoken = Cookies.get('csrftoken');

const start = async () => {

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


function renderPage(currentUser) {
	console.log('why rerendering?')
	class App extends React.Component {
		constructor(props) {
			super(props);
			this.state = {
				'error': '',
				'msg': '',
				'view': 'library',
				'currentUser': currentUser,
				'listFilter': 'all',
				'entryId': '',
				'entryUpdateCount': 0,
				'searchInput': '',
				'wordId': '',
				'wordEntry': '',
				'showSearchResults': false,
				'errorMessage': '',
				'warningMessage': '',
				'wordEntry': {},
				'wordId': '',

			}
		};

		render() {
			return (
				<div className="body">
					<div className="view__side">
						<div className="searchForm">
							<InputText value={ this.state.searchInput } update={(value) => this.setState({ searchInput: value })} placeholder="Type a word to search"/>
							<button className="ml-2 btn btn-primary" onClick={ this.actionWordSearch }>Search</button>
						</div>
						<SideBar
							view = { (view) => this.setState({ view: view }) }
							filterLibrary = { (filter) => this.setState({ "listFilter": filter}) }
							listCountSummary={ this.state.currentUser.listCountSummary }
							userName={ this.state.currentUser.userName }
						/>
					</div>
					<div className="view__main">
						{ this.state.view === 'wordEntry'
							? <WordSearch
								wordEntry={ this.state.wordEntry }
								wordId={ this.state.wordId }
								done={ () => { this.setState({ view: 'main' }) } }
							 />
							: null }
						{ this.state.view === 'library' ? <Library
							key={ this.state.listFilter }
							userId = { this.state.currentUser.userId }
							listFilter={ this.state.listFilter }
							reloadLibrary = { () => this.loadUser() }
							showEntry = { (event) => this.loadEntry(event) }
							selectEntry = { (entryId) => this.loadEntry(entryId) }
						 /> : null }
						{ this.state.view == 'entry'
							? <LibraryEntry 
								entry={ this.state.entry }
								update={ (event) => this.loadEntry(event) }
								delete={ () => this.loadUser() && this.setState({ view: 'library' }) }
								key={ `${this.state.entry.id}_${this.state.entryUpdateCount}` }
							/> : null }
						</div>
					</div>
			)
		};

		loadEntry = async (entryId) => {
			await secureFetch(`v1/entries/${entryId}`).then(result => {
				
				this.setState({ entry: result.data })
				this.setState({ view: 'entry' })
				this.setState({ entryUpdateCount: this.state.entryUpdateCount + 1 })
				console.log(result.data)
				this.loadUser();
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
		};

		actionWordSearch = async () => {
			this.setState(() => { 
				return {
					showSearchResults: false,
					errorMessage: '',
					warningMessage: '',
				}
			});


			await secureFetch(`v1/words/search?q=${this.state.searchInput}`)
			.then(result => {
				this.setState({ wordId: result.wordId });
				this.setState({ wordEntry: result.data });
				this.setState({ view: 'wordEntry' });
				this.setState({ showSearchResults: true });
			})
			.catch(error => {
				this.setState(() => {
					return {
						errorMessage: error.error,
						warningMessage: error.warning,
						addCustomEntry: error.allow || false
					};

				});
			});
		};

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




