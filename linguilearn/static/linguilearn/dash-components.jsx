

const SideBar = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'error': '',
			'msg': '',
		}
	};

	render() {
		return (
			<div className='sideBar'>
				<div className="navTabs">
					<div className={`navTabs__item ${this.props.active === 'all' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('all') }>All ({ this.props.listCountSummary.totalCount })</div>
					<div className={`navTabs__item ${this.props.active === 'learning' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('learning') }>Learning ({ this.props.listCountSummary.learningCount })</div>
					<div className={`navTabs__item ${this.props.active === 'mastered' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('mastered') }>Mastered ({ this.props.listCountSummary.masteredCount })</div>
					<div className={`navTabs__item ${this.props.active === 'custom' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('custom') }>Custom ({ this.props.listCountSummary.customCount })</div>
					<div className={`navTabs__item ${this.props.active === 'favourites' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('favourites') }>Favourites ({ this.props.listCountSummary.favouritesCount })</div>
				</div>
			</div>
		)
	};

};


const InputText = class extends React.Component {
	render() {
		return (
			<input className="form-control" placeholder={ this.props.placeholder } value={ this.props.value } onChange={ (e) => { this.props.update(e.target.value) }}/>
		)
	};
};

// Component to present the search results to the user
const WordEntry = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		}
	};

	render() {
		// Build out all the result 'cards/rows'
		let list = [];
		this.props.entry.list.forEach((item, index) => {
			list.push(<li className="list-group-item" key={ index }>
				<p><em className="mr-1">{ item.partOfSpeech }.</em><strong>{ item.definition }</strong></p>
				{ item.examples.length > 0 ?
					<div>
						<p>Examples:</p>
						<ol>{ item.examples.map(ex => <li key={ ex }>{ ex }</li> )}</ol>
					</div>
					: null
				}
				{ item.synonyms.length > 0 ? <p>Synonyms: { item.synonyms.join(', ') } </p> : null }
				{ item.similarTo.length > 0 ? <p>Similar: { item.similarTo.join(', ') }</p> : null }
				{ item.usageOf.length > 0 ? <p>Usage: { item.usageOf.join(', ') }</p> : null }
			</li>)
		});

		return (
			<div className="card">
				<div className="card-header">
					<p className="card-text">{ this.props.entry.syllables.list.join('-')}</p>
				</div>
				<ul className="list-group list-group-flush">{ list }</ul>
			</div>
		)
	};
};


const WordSearch = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showSearchResults: true,
			error: '',
		}
	};


	render() {
		return (
			<div className="view">
				{ this.state.error ? <p className="alert alert-danger">{ this.state.error }</p> : null }
				{ this.state.showSearchResults ?
					<div>
						<h3 className="mb-3 ml-2">{ this.props.wordEntry.word }</h3>
						<WordEntry entry={ this.props.wordEntry } />
						<button className="btn btn-primary mt-3" onClick={ () =>  this.actionSaveEntry() }>Add to Library</button>
					</div>
					: null
				}
			</div>
		)
	};


	actionSaveEntry = async (event) => {

		// TODO validate the word to be a one-word string

		const url = this.state.addCustomEntry && this.props.wordId === '' ? `v1/entries/${this.state.searchInput}/addcustom` : `v1/entries/${this.props.wordId}/add`
		
		await secureFetch(url, 'POST')
		.then(async (result) => {
			if (result.data && result.data.entryId) {
				await this.setState(() => {
					return {
						success: true,
						step: 'done',
						entryId: result.data.entryId,
						error: 'dfd',
					}
				});
				this.props.add(result.data.entryId)
			}
		})
		.catch(error => {
			this.state.setState({ error: error.error });
			
		});
	};
};


const Pagination = class extends React.Component {
	componentDidMount() {
		feather.replace()
	}
	render() {
		feather.replace()
		return (
			<div className="paginationWrapper">
				<ul className="pagination pagination-sm mb-0">
					<p className="ml-3 mr-2">Limit:</p>
					<select className="form-control form-control-sm" value={ this.props.limit } onChange={ (e) => this.actionLimitUpdate(parseInt(e.target.value, 10)) }>
						<option value="5">5</option>
						<option value="10">10</option>
						<option value="20">20</option>
						<option value="50">50</option>
						<option value="100">100</option>
						<option value="200">200</option>
					</select>
					<select className="form-control form-control-sm" value={ this.props.order.replace('-', '') } onChange={ (e) => this.actionOrderUpdate(this.props.direction + e.target.value) }>
						<option value="word__text">abc</option>
						<option value="created_at">date</option>
						<option value="?">random</option>
					</select>
					{ this.props.order !== '?' ?
						<button className="btn btn-sm btn-primary"
							onClick={ () => this.actionOrderUpdate((this.props.direction === '-' ? '' : '-') + this.props.order.replace('-', '')) }>Reverse</button>
					: <button className="btn btn-sm btn-primary" onClick={ () => this.actionOrderUpdate('?') }>Shuffle</button> }
				</ul>
				<ul className="pagination pagination-sm mb-0">
					<li onClick={ () => this.actionPageUpdate(1, this.props.prev) } className={ `page-item ${this.props.prev ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevrons-left" className=""></i></a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.page - 1, this.props.prev) } className={ `page-item ${this.props.prev ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevron-left" className=""></i></a></li>
					<li className="page-item active"><a className="page-link">{ `Page ${this.props.page} of ${this.props.numPages}` }</a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.page + 1, this.props.next) } className={ `page-item ${this.props.next ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevron-right" className=""></i></a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.numPages, this.props.next) } className={ `page-item ${this.props.next ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevrons-right" className=""></i></a></li>
				</ul>
			</div>
		)
	};

	actionPageUpdate = (page, canUpdate) => {
		if (page !== this.props.page && canUpdate) this.props.updatePagination({ page, limit: this.props.limit  });
	};

	actionLimitUpdate = (limit) => {
		if (limit !== this.props.limit) this.props.updatePagination({ page: this.props.page, limit });
	};

	actionOrderUpdate = (order) => {
		this.props.updatePagination({ page: this.props.page, limit: this.props.limit, order: order })
	};

};


const LibraryEntry = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userId: '',
			list: [],
			showWordDetails: true,
			wordEntryDetails: null,
			showEntryForm: false,
			context: '',
			author: '',
			source: '',
			notes: '',
			error: '',
		}
	};

	initialState = {
		userId: '',
		list: [],
		showWordDetails: true,
		showEntryForm: false,
		context: '',
		author: '',
		source: '',
		notes: '',
		error: '',

	}
	componentDidMount() {
		const { context, source, author, notes } = this.props.entry;
		this.setState({ context, source, author, notes });
	}

	componentWillUnmount() {
		this.setState(this.initialState);
		const { context, source, author, notes } = this.props.entry.details;
		
		feather.replace()
	}

	render() {
		return (
			<div className="">
				{ this.state.error ? <p className="alert alert-danger">{ this.state.error || 'Something went wrong' }</p> : null }
				<div className="libraryEntry__content card mb-2">
				<div className="container flex card-header">
					<h3 className="flex mr-auto">
						{ this.props.entry.favourites
							? <span onClick={ () => { this.actionUpdateEntry({ favourites: false }) }} className="icon icon__heart">&#9829;</span>
							: <span onClick={ () => { this.actionUpdateEntry({ favourites: true }) }} className="icon icon__heart">&#9825;</span>
						}
						<span className="ml-2">{ this.props.entry.word }</span>
						</h3>
					
						<select className="form-control" value={ this.props.entry.entry_list }
							onChange={ (e) => { this.actionUpdateEntry({ entry_list: e.target.value }) }}>
							<option value="0">None</option>
							<option value="1">Learning</option>
							<option value="2">Mastered</option>
							<option value="3">Archived</option>
						</select>
						{ this.state.showEntryForm
							? <button className="btn btn-primary ml-3" onClick = { () => this.actionUpdateEntry({}) }>Save</button>
							: <button className="btn btn-primary ml-3" onClick = { () => this.setState({ showEntryForm: true }) }>Edit</button>
						}
						<button className="btn btn-primary ml-3" onClick={ () => this.actionDeleteEntry() }>
							<i data-feather="trash-2" className=""></i>
						</button>
					</div>
					<div className="card-body">
						<ul className="infoBox__group container">
							<li className="card">
								<p className="card-header"><i data-feather="anchor"></i><span>Context</span></p>
								{ this.state.showEntryForm
									? <p className="card-body">
										<input className="form-control" type="text" value={ this.state.context } onChange={ (e) => this.setState({ context: e.target.value }) }/>
									  </p>
									: <p className="card-body"> { this.props.entry.context }</p>
								}
							</li>
							<li className="card">
								<p className="card-header"><i data-feather="bookmark"></i><span>Source</span></p>
								{ this.state.showEntryForm
									? <p className="card-body">
										<input className="form-control" type="text" value={ this.state.source } onChange={ (e) => this.setState({ source: e.target.value }) }/>
									  </p>
									: <p className="card-body"> { this.props.entry.source }</p>
								}
							</li>
							<li className="card">
								<p className="card-header"><i data-feather="user"></i><span>Author</span></p>
								{ this.state.showEntryForm
									? <p className="card-body">
										<input className="form-control" type="text" value={ this.state.author } onChange={ (e) => this.setState({ author: e.target.value }) }/>
									  </p>
									: <p className="card-body"> { this.props.entry.author }</p>
								}
							</li>
						</ul>
						<ul className="infoBox__group container">
							<li className="card">
								<p className="card-header"><i data-feather="edit-2"></i><span>Notes</span></p>
								{ this.state.showEntryForm
									? <p className="card-body">
										<textarea className="form-control" type="text" value={ this.state.notes } onChange={ (e) => this.setState({ notes: e.target.value }) }></textarea>
									  </p>
									: <p className="card-body" id="notes"><span dangerouslySetInnerHTML={{ __html: this.props.entry.notesMarkdown }}></span></p>
								}
							</li>
						</ul>
					</div>
				</div>

				{ this.state.showWordDetails && this.props.entry.details && !this.props.entry.isCustomWord
					? <div><WordEntry entry={ this.props.entry.details } /></div>
					: null }

			</div>
		)
	};

	actionUpdateEntry = async ({ entry_list, favourites }) => {
		const { context, source, author, notes } = this.state;
		const fields = { context, source, author, notes };
		if (entry_list && entry_list !== undefined) {
			fields['entry_list'] = entry_list;
		}
		if (favourites !== undefined) {
			fields['favourites'] = favourites;
		}
		await secureFetch(`v1/entries/${this.props.entry.id}/update`, 'POST', fields).then(result => {
			this.setState({ showEntryForm: false });
			this.setState({ error: '' });
			this.props.update(this.props.entry.id);
		}).catch(error => {
			this.state.setState({ error: error.error });
		})
	};

	actionDeleteEntry = async () => {
		await secureFetch(`v1/entries/${this.props.entry.id}/delete`, 'POST').then(result => {
			this.setState({ showEntryForm: false });
			this.setState({ error: '' });
			this.props.delete();
		}).catch(error => {
			this.state.setState({ error: error.error });
		})
	}
};


