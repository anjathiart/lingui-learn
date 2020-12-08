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
				errorMessage: '',
				warningMessage: '',
				error: '',
				msg: '',
				view: 'library',
				currentUser: currentUser,
				listFilter: 'all',
				entry: {},
				entryUpdateCount: 0,
				searchInput: '',
				showSearchResults: false,
				errorMessage: '',
				warningMessage: '',
				wordEntry: {},
				wordId: '',
				list: [],
				page: 2,
				limit: 5,
				numPages: '',
				prev: '',
				next: '',

			}
		};

		async componentDidMount() {
			//  fetch users library
			await this.actionFetchLibrary(`page=${this.state.page}&limit=${this.state.limit}`)
		}

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
							filterLibrary={ (filter) => this.filterLibrary(filter) }
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
						 { this.state.view === 'library' ?
							<div>
								<Pagination
									page={ this.state.page }
									limit={ this.state.limit }
									numPages={ this.state.numPages }
									next={ this.state.next }
									prev={ this.state.prev }
									updatePagination={ ({ page, limit}) => this.actionPagination(page, limit) }
								/>
								<div className="row wordGrid" >
									{ this.state.list.map((entry, i) => {
										return (
											<div className="col-sm-auto wordGrid__item" key={ entry.id }>
												<p onClick={ () => this.loadEntry(entry.id) }>{ entry.word }</p>
											</div>
										)
									})}
								</div>
							</div>
						: null }
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

		actionFetchLibrary = async () => {
			let query = `filter=${this.state.listFilter}&page=${this.state.page}&limit=${this.state.limit}`
			await secureFetch(`v1/users/${currentUser.userId}/library?${query}`).then(result => {

				this.setState(() => {
					return {
						page: parseInt(result.data.page, 10),
						limit: parseInt(result.data.limit, 10),
						numPages: parseInt(result.data.num_pages, 10),
						prev: result.data.prev,
						next: result.data.next,
						list: result.data.list,
						view: 'library'
					}
				})
			}).catch(error => {
				console.log({error})
			});
		};

		actionPagination = async (page, limit) => {
			await this.setState(() => {
				return {
					page: page,
					limit: limit,
				};
			});
			this.actionFetchLibrary();

		};

		filterLibrary = async (filter) => {
			await this.setState(() => {
				return { listFilter: filter }
			});
			this.actionFetchLibrary();
		};

		loadEntry = async (entryId) => {
			await secureFetch(`v1/entries/${entryId}`).then(result => {
				this.setState(() => {
					return {
						entry: result.data,
						view: 'entry',
						entryUpdateCount: this.state.entryUpdateCount + 1
					}
				});
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
				this.setState(() => {
					return {
						wordId: result.wordId,
						wordEntry: result.data,
						view: 'wordEntry',
						showSearchResults: true
					}
				});
			})
			.catch(error => {
				console.log({error})
				this.setState(() => {
					return {
						errorMessage: error.error,
						warningMessage: error.warning,
						addCustomEntry: error.allow || false
					};

				});
			});
		};
	}

	ReactDOM.render(<App />, document.querySelector("#app"));
}




