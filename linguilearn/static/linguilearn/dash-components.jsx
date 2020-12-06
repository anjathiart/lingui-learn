

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
					<div className="navTabs__item" onClick={ () => this.actionViewLibrary('all') }>All ({ this.props.listCountSummary.totalCount })</div>
					<div className="navTabs__item" onClick={ () => this.actionViewLibrary('learning') }>Learning ({ this.props.listCountSummary.learningCount })</div>
					<div className="navTabs__item" onClick={ () => this.actionViewLibrary('mastered') }>Mastered ({ this.props.listCountSummary.masteredCount })</div>
					<div className="navTabs__item" onClick={ () => this.actionViewLibrary('archived') }>Archived ({ this.props.listCountSummary.archivedCount })</div>
					<div className="navTabs__item" onClick={ () => this.actionViewLibrary('favourites') }>Favourites ({ this.props.listCountSummary.favouritesCount })</div>
				</div>
			</div>
		)
	};

	actionViewLibrary = async (filter) => {
		this.props.filterLibrary(filter);
		this.props.view('library');
		
	}
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
			list.push(<div className="entry__item" key={ index }>
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
			</div>)
		});

		return (
			<div className="entry">
				<h1>{ this.props.entry.word }</h1>
				<p>{ this.props.entry.syllables.list.join('-')}</p>
				<div>{ list }</div>
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
						<button className="btn btn-primary" onClick={ this.fillOwnDetails }>Add to Library</button>
					</div>
					: null
				}
				{ this.state.errorMessage ? <p>{ this.state.errorMessage }</p> : null }
				{ this.state.warningMessage ? <p>{ this.state.warningMessage }</p> : null }
				{ this.state.addCustomEntry ? <button className="btn btn-primary" onClick={ this.fillOwnDetails }>Add Custom Entry?</button> : null }
				{ this.state.step === 'form' || this.state.step === 'done' ? 
					<div className="modal">
						<div className="modal__content">
							{ this.state.step === 'form' ? <WordEntryForm key="x" save={ (event) => this.actionSaveEntry(event) }/> : null }
							{ this.state.step === 'done' ? 
							<div>
								<p>Entry added to your Library</p>
								<button className="btn btn-primary" onClick={ () => this.props.done() }>Go to Library</button>
								<button className="btn btn-primary" onClick={ () => this.setState({ step: "search" }) }>Back to search</button>
							</div>
							: null }
						</div>
				</div> : null }
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
		const fields = { ...event };

		// TODO validate the word to be a one-word string

		const url = this.state.addCustomEntry && this.props.wordId === '' ? `v1/entries/${this.state.searchInput}/addcustom` : `v1/entries/${this.props.wordId}/add`
		
		await secureFetch(url, 'POST', fields)
		.then(result => {
			if (result.data && result.data.entryId) {
				this.setState(() => {
					return {
						success: true,
						step: 'done',
						entryId: result.data.entryId,
					}
				});
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


const Library = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userId: '',
			list: [],
			selectedEntry: -1,
		}
	};

	async componentDidMount() {
		//  fetch users library
		await this.actionFetchLibrary()
	}

	render() {
		return (
			<div className="container">
				<div className="row wordGrid" >
				{ this.state.list.map((entry, i) => {
					return (
						<div className="col-sm-auto wordGrid__item" key={ entry.id }>
							<p onClick={ () => this.props.selectEntry(entry.id) }>{ entry.word }</p>
						</div>
					)
				})}
				</div>
			</div>
		)
	};

	actionFetchLibrary = async () => {
		await secureFetch(`v1/users/${this.props.userId}/library?filter=${this.props.listFilter}`).then(result => {
			this.props.reloadLibrary();
			this.setState({ list: result.data.list });
		}).catch(error => {
			console.log({error})
		})
	}
};

const LibraryEntry = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userId: '',
			list: [],
			showWordDetails: true,
			wordEntryDetails: null,
		}
	};

	initialState = {
		userId: '',
		list: [],
		showWordDetails: true,
		showEntryForm: false,
	}

	componentWillUnmount() {
		console.log('mounting')
		this.setState(this.initialState)
		console.log(this.props.entry)
	}

	render() {
		return (
			<div className="">
				<div className="libraryEntry__content">
					<p>Context: { this.props.entry.context }</p>
					<p>Source: { this.props.entry.source }</p>
					<p>Author: { this.props.entry.author }</p>
					<p>Notes: { this.props.entry.notes }</p>
					<button className="btn btn-primary" onClick = { () => this.setState({ showEntryForm: true }) }>Edit</button>
				</div>


				 <div className="form-group"
					 	
					 	>
					<label>Choose which list this entry should be in { this.props.entry.entry_list }</label>
					<select className="form-control" value={ this.props.entry.entry_list }
						onChange={ (e) => { this.actionUpdateEntry({ entry_list: e.target.value }) }}>
						<option value="0">None</option>
						<option value="1">Learning</option>
						<option value="2">Mastered</option>
						<option value="3">Archived</option>
					</select>
				</div>

				<button className="btn btn-primary" onClick={ () => this.actionDeleteEntry() }>Delete entry</button>

				{ this.props.entry.favourites
					? <button className="btn btn-primary" onClick={ () => { this.actionUpdateEntry({ favourites: false }) }}>Remove from favourites</button>
					: <button className="btn btn-primary" onClick={ () => { this.actionUpdateEntry({ favourites: true }) }}>Add to favourites</button>
				}

				{ this.state.showEntryForm ? <div className="modal">
					<div className="modal__content">
						<WordEntryForm 
							inputValues={ { context: this.props.entry.details.context, source: this.props.entry.details.source} }
							save={ (event) => this.actionUpdateEntry(event) }
						/>
					</div>
				</div> : null }

				{ this.state.showWordDetails
					? <div><WordEntry entry={ this.props.entry.details } /></div>
					: null }

			</div>
		)
	};

	actionUpdateEntry = async (event) => {
		const fields = { ...event };
		console.log({fields})
		await secureFetch(`v1/entries/${this.props.entry.id}/update`, 'POST', fields).then(result => {
			this.setState({ showEntryForm: false });
			this.props.update(this.props.entry.id);
		}).catch(error => {
			// console.log({error})
		})
	}

	actionDeleteEntry = async () => {
		await secureFetch(`v1/entries/${this.props.entry.id}/delete`, 'POST').then(result => {
			this.setState({ showEntryForm: false });
			this.props.delete();
		}).catch(error => {
			// console.log({error})
		})
	}
};


