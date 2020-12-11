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
				view: 'library',
				currentUser: currentUser,
				listFilter: 'all',
				entry: {},
				entryUpdateCount: 0,
				searchInput: '',
				showSearchResults: false,
				errorMessage: '',
				warningMessage: '',
				customWord: false,
				wordEntry: {},
				wordId: '',
				list: [],
				page: 1,
				limit: 6,
				order: '-created_at', // options: { alpha: 'word__text'}, { random: '?' } || direction is the '-' thingy
				numPages: '',
				prev: '',
				next: '',
				loading: false,

			}
		};

		async componentDidMount() {
			//  fetch users library
			await this.actionFetchLibrary();
		}

		render() {
			return (
				<div className="body">
					<div className="view__side">
						<div className="searchForm">
							<InputText value={ this.state.searchInput } update={(value) => this.setState({ searchInput: value })} placeholder="Type a word to search"/>
							<div className="ml-2 icon" onClick={ this.actionWordSearch }><i data-feather="search" className=""></i></div>
						</div>
						<SideBar
							view = { (view) => this.setState({ view: view }) }
							filterLibrary={ (filter) => this.filterLibrary(filter) }
							listCountSummary={ this.state.currentUser.listCountSummary }
							userName={ this.state.currentUser.userName }
							active={ this.state.listFilter }
						/>
					</div>
					<div className="view__main">
						{ this.state.loading ? 
							<div className="loader">Searching...</div>
							: null }
						{ this.state.view === 'customWord'
							? <div>
								<h3 className="mb-2">{ this.state.searchInput.trim().toLowerCase().split(' ')[0] }</h3>
								<p className="alert alert-danger"> This word could not be found in the conventional places! Add it anyway?</p>
								<button className="btn btn-primary" onClick={ () => { this.addCustomEntry() } }>Add it anyway!</button>
								</div>
							: null }
						{ this.state.view === 'wordEntry' && !this.state.loading
							? <WordSearch
								wordEntry={ this.state.wordEntry }
								wordId={ this.state.wordId }
								add={ (entryId) => { this.loadEntry(entryId) } }
								done={ () => { this.setState({ view: 'main' }) } }
							 />
							: null }
						 { this.state.view === 'library' && !this.state.loading ?
							<div className="card text-center">
								<div className="card-body">
									<Pagination
										page={ this.state.page }
										limit={ this.state.limit }
										order={ this.state.order.replace('-', '') }
										direction={ this.state.order[0] === '-' ? '-' : '' }
										numPages={ this.state.numPages }
										next={ this.state.next }
										prev={ this.state.prev }
										updatePagination={ ({ page, limit, order}) => this.actionPagination(page, limit, order || this.state.order) }
									/>
								</div>
								<div className="card-footer">
									<div className="row wordGrid" >
										{ this.state.list.map((entry, i) => {
											let classes = 'btn btn-lg ' + 'btn-outline-' + (entry.entry_list == 1 ? 'primary' : (entry.entry_list == 2 ? 'success': 'secondary' ))
											console.log(classes)
											return (
												<div className="wordGrid__item" key={ entry.id }>
													<button onClick={ () => this.loadEntry(entry.id) }
														key={ entry.id }
														className={ classes }
													>{ entry.word }
													</button>
												</div>
											)
										})}
									</div>
								</div>
							</div>
						: null }
						{ this.state.view == 'entry' && !this.state.loading
							? <LibraryEntry 
								entry={ this.state.entry }
								update={ (event) => this.loadEntry(event) }
								delete={ () => this.actionFetchLibrary() && this.loadUser() && this.setState({ view: 'library' }) }
								key={ `${this.state.entry.id}_${this.state.entryUpdateCount}` }
							/> : null }
						</div>
					</div>
			)
		};

		actionFetchLibrary = async () => {
			let query = `filter=${this.state.listFilter}&page=${this.state.page}&limit=${this.state.limit}&order=${this.state.order}`
			await secureFetch(`v1/users/library?${query}`).then(async result => {

				await this.setState(() => {
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
				// this.loadUser();

				feather.replace()
			}).catch(error => {
				console.log({error})
			});
		};

		actionPagination = async (page, limit, order) => {
			await this.setState(() => {
				return {
					page: page,
					limit: limit,
					order: order,
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

		addCustomEntry = async () => {
			let word = this.state.searchInput.trim().toLowerCase().split(' ')[0];
			await secureFetch(`v1/entries/${word}/addcustom`, 'POST').then(async result => {
				console.log({result})
				await this.loadEntry(result.data.entryId)

			}).catch(error => {

			})
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
				feather.replace();
			}).catch(error => {
				console.log({ error });
			})
		};

		getClassNames = (list) => {
			console.log({ list })
			let names = 'btn btn-outline-dark';
			if (list === '1') {
				names = names.replace('dark', 'primary');
			} else if (list === '2') {
				names = names.replace('dark', 'success');
			} else if (list === 'archived') {
				names = names.replace('dark', 'secondary');
			}
			return names;
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
					loading: true,
				}
			});


			await secureFetch(`v1/words/search?q=${this.state.searchInput}`)
			.then(result => {
				this.setState(() => {
					return {
						wordId: result.wordId,
						wordEntry: result.data,
						view: 'wordEntry',
						showSearchResults: true,
						loading: false,
					}
				});
			})
			.catch(error => {

				if (error.allow === true) {
					this.setState({ view: 'customWord'});
					this.setState({ loading: false });
				} else {
					this.setState({ errorMessage: error.error });
				}

			});
		};
	}

	ReactDOM.render(<App />, document.querySelector("#app"));
}




