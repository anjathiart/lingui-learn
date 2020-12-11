

const ErrorBlanket = class extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal__content">
					<p>{ this.props.msg }</p>
					<button className="btn btn-primary" onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
				</div>
			</div>
		);
	}
};

const MessageBlanket = class extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal__content">
					<p>{ this.props.msg }</p>
					<button className="btn btn-primary" onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
				</div>
			</div>
		);
	}
};


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
				{ this.state.error && <ErrorBlanket msg={ this.state.error } onClose={ () => this.setState({ 'error': '' }) } /> }
				{ this.state.msg && <MessageBlanket msg={ this.state.msg } onClose={ () => this.setState({ 'msg': '' }) } /> }
				<div className="navTabs">
					<div className={`navTabs__item ${this.props.active === 'all' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('all') }>All ({ this.props.listCountSummary.totalCount })</div>
					<div className={`navTabs__item ${this.props.active === 'learning' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('learning') }>Learning ({ this.props.listCountSummary.learningCount })</div>
					<div className={`navTabs__item ${this.props.active === 'mastered' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('mastered') }>Mastered ({ this.props.listCountSummary.masteredCount })</div>
					<div className={`navTabs__item ${this.props.active === 'archived' ? 'navTabs--active' : null}`} onClick={ () => this.props.filterLibrary('archived') }>Archived ({ this.props.listCountSummary.archivedCount })</div>
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
			searchInput: '',
			showSearchResults: true,
			wordId: '',
			wordEntry: '',
			addCustomEntry: false,
			step: 'search',
			entryId: '',
			errorMessage: '',
			warningMessage: '',
			fillOwnDetails: false,
		}
	};


	render() {
		return (
			<div className="view">
				{ this.state.showSearchResults ?
					<div>
						<WordEntry entry={ this.props.wordEntry } />
						<button className="btn btn-primary" onClick={ () =>  this.actionSaveEntry() }>Add to Library</button>
					</div>
					: null
				}
				{ this.state.errorMessage ? <p>{ this.state.errorMessage }</p> : null }
				{ this.state.warningMessage ? <p>{ this.state.warningMessage }</p> : null }
				{ this.state.addCustomEntry ? <button className="btn btn-primary" onClick={ this.fillOwnDetails }>Add Custom Entry?</button> : null }
			</div>
		)
	};

	fillOwnDetails = () => {
		this.setState(() => {
			return {
				fillOwnDetails: true,
				step: 'form',
			}
		});
	};

	actionSaveEntry = async (event) => {
		// const fields = { ...event };

		// TODO validate the word to be a one-word string

		const url = this.state.addCustomEntry && this.props.wordId === '' ? `v1/entries/${this.state.searchInput}/addcustom` : `v1/entries/${this.props.wordId}/add`
		
		await secureFetch(url, 'POST')
		.then(async (result) => {
			console.log({result})
			if (result.data && result.data.entryId) {
				await this.setState(() => {
					return {
						success: true,
						step: 'done',
						entryId: result.data.entryId,
					}
				});
				this.props.add(result.data.entryId)
			}
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
};


const WordEntryForm = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			inputValues: {
				context: 'He ate a poisonous apple',
				source: 'The Trial',
				author: 'Franz Kafka',
				url: 'www.google.com',
				notes: '',
				label: '',          
			}
		};
	};

	componentDidMount() {
		if (this.props.inputValues) {

			for (let i = 0; i < Object.keys(this.props.inputValues).length; i += 1) {
				let key = Object.keys(this.props.inputValues)[i]
				this.actionInput(key, this.props.inputValues[key] )
			}
		}
	}

	render() {
		return (
			<div className=''>
				<div className="wordEntryForm form">
					<div className="form-group">
						<label>Context:</label>
						<InputText value={ this.state.inputValues.context } update={(value) => this.actionInput('context', value)} placeholder="Context"/>
					</div>
					<div className="form-group">
						<label>Source / Title</label>
						<InputText value={ this.state.inputValues.source } update={(value) => this.actionInput('source', value)} placeholder="Source"/>
					</div>
					<div className="form-group">
						<label>Author</label>
						<InputText value={ this.state.inputValues.author } update={(value) => this.actionInput('author', value)} placeholder="Author"/>
					</div>
					<div className="form-group">
						<label>Link / Url</label>
						<InputText value={ this.state.inputValues.url } update={(value) => this.actionInput('url', value)} placeholder="URL link"/>
					</div>
					<button className="btn btn-primary" onClick={ () => this.props.save(this.state.inputValues) }>Save To Library</button>
				</div>
			</div>
		)
	};

	actionInput = (key, value) => {
		this.setState(prevState => {
			// make a copy of the previous inputValues object
			let inputValues = {...prevState.inputValues };
			// update the key/value pair
			inputValues[key] = value;
			// return new state
			return { inputValues };
		})
	}
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
					<li onClick={ () => this.actionPageUpdate(1, this.props.prev) } className={ `page-item ${this.props.prev ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevrons-left" className=""></i></a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.page - 1, this.props.prev) } className={ `page-item ${this.props.prev ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevron-left" className=""></i></a></li>
					<li className="page-item active"><a className="page-link">{ `Page ${this.props.page} of ${this.props.numPages}` }</a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.page + 1, this.props.next) } className={ `page-item ${this.props.next ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevron-right" className=""></i></a></li>
					<li onClick={ () => this.actionPageUpdate(this.props.numPages, this.props.next) } className={ `page-item ${this.props.next ? null : 'disabled'}` }><a className="page-link"><i data-feather="chevrons-right" className=""></i></a></li>
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
							? <button className="btn btn-primary ml-3" onClick = { () => this.actionUpdateEntry() }>Save</button>
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
										<textarea className="form-control" type="text" value={ this.state.notes } onChange={ (e) => this.setState({ notes: e.target.value }) }/>
									  </p>
									: <p className="card-body"> { this.props.entry.notes }</p>
								}
							</li>
						</ul>
					</div>
				</div>

				{ this.state.showWordDetails
					? <div><WordEntry entry={ this.props.entry.details } /></div>
					: null }

			</div>
		)
	};

	actionUpdateEntry = async ({ entry_list }) => {
		const { context, source, author, notes } = this.state;
		const fields = { context, source, author, notes };
		if (entry_list !== undefined) {
			fields['entry_list'] = entry_list;
		}
		await secureFetch(`v1/entries/${this.props.entry.id}/update`, 'POST', fields).then(result => {
			this.setState({ showEntryForm: false });
			this.props.update(this.props.entry.id);
		}).catch(error => {
			// console.log({error})
		})
	};

	actionDeleteEntry = async () => {
		await secureFetch(`v1/entries/${this.props.entry.id}/delete`, 'POST').then(result => {
			this.setState({ showEntryForm: false });
			this.props.delete();
		}).catch(error => {
			// console.log({error})
		})
	}
};


