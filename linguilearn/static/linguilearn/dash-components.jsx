

const ErrorBlanket = class extends React.Component {
	render() {
		return (
			<div className="modal">
				<div className="modal__content">
					<p>{ this.props.msg }</p>
					<button onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
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
					<button onClick={ this.props.onClose.bind(this) } className="btn btn-primary btn-lg">OK</button>
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
				<h1>{ this.props.userName }</h1>
				<p onClick={ () => this.actionViewLibrary('all') }>Library ({ this.props.listCountSummary.totalCount })</p>
				<p>Lists</p>
				<ul>
					<li onClick={ () => this.actionViewLibrary('learning') }>Learning ({ this.props.listCountSummary.learningCount })</li>
					<li onClick={ () => this.actionViewLibrary('mastered') }>Mastered ({ this.props.listCountSummary.masteredCount })</li>
					<li onClick={ () => this.actionViewLibrary('archived') }>Archived ({ this.props.listCountSummary.archivedCount })</li>
				</ul>
				<p onClick={ () => this.actionViewLibrary('favourites') }>Favourites ({ this.props.listCountSummary.favouritesCount })</p>
				<p onClick={ this.props.view.bind(this, 'search') }>Search Words</p>
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
			<div className="wordEntry">
				<input placeholder={ this.props.placeholder } value={ this.props.value } onChange={ (e) => { this.props.update(e.target.value) }}/>
			</div>
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
			showSearchResults: false,
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
				<div className="flex">
					<InputText value={ this.state.searchInput } update={(value) => this.setState({ searchInput: value })} placeholder="Type a word to search"/>
					<button className="button ml-2" onClick={ this.actionWordSearch }>Search</button>
				</div>
				{ this.state.showSearchResults ?
					<div>
						<WordEntry entry={ this.state.wordEntry } />
						<button onClick={ this.fillOwnDetails }>Add to Library</button>
					</div>
					: null
				}
				{ this.state.errorMessage ? <p>{ this.state.errorMessage }</p> : null }
				{ this.state.warningMessage ? <p>{ this.state.warningMessage }</p> : null }
				{ this.state.addCustomEntry ? <button onClick={ this.fillOwnDetails }>Add Custom Entry?</button> : null }
				{ this.state.step === 'form' || this.state.step === 'done' ? 
					<div className="modal">
						<div className="modal__content">
							{ this.state.step === 'form' ? <WordEntryForm key="x" save={ (event) => this.actionSaveEntry(event) }/> : null }
							{ this.state.step === 'done' ? 
							<div>
								<p>Entry added to your Library</p>
								<button onClick={ () => this.setState({ step: "library" }) }>Go to Library</button>
								<button onClick={ () => this.setState({ step: "search" }) }>Back to search</button>
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

	actionSaveEntry = async (event) => {
		const fields = { ...event };

		// TODO validate the word to be a one-word string

		const url = this.state.addCustomEntry && this.state.wordId === '' ? `v1/entries/${this.state.searchInput}/addcustom` : `v1/entries/${this.state.wordId}/add`
		
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
				<div className="wordEntryForm">
					<p>Context:</p>
					<InputText value={ this.state.inputValues.context } update={(value) => this.actionInput('context', value)} placeholder="Context"/>
					<p>Source / Title</p>
					<InputText value={ this.state.inputValues.source } update={(value) => this.actionInput('source', value)} placeholder="Source"/>
					<p>Author</p>
					<InputText value={ this.state.inputValues.author } update={(value) => this.actionInput('author', value)} placeholder="Author"/>
					<p>Link / Url</p>
					<InputText value={ this.state.inputValues.url } update={(value) => this.actionInput('url', value)} placeholder="URL link"/>
					<button onClick={ () => this.props.save(this.state.inputValues) }>Save To Library</button>
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
			<div>
				<h1>Library</h1>
				{ this.state.list.map((entry, i) => {
					return (
						<div className="entry" key={ entry.id }>
							<p onClick={ () => this.setState({ selectedEntry: i })}>{ entry.word }</p>
							<button>Delete entry</button>

							{ this.state.selectedEntry === i 
								? <LibraryEntry
									entry={ entry }
									update={ (event) => this.actionFetchLibrary() }
									delete={ () => this.props.reloadLibrary() && this.actionFetchLibrary() }
									key={ 'entry' + i }/> 
								: null }
						</div>
					)
				})}
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
		wordEntryDetails: null,
		showEntryForm: false,
	}

	async componentDidMount() {
		//  fetch users library
		await this.loadWordDetails();
	}

	componentWillUnmount() {
		this.setState(this.initialState)
	}

	render() {
		let entry = this.state.wordEntryDetails;
		return (
			<div className="libraryEntry">

				<div className="libraryEntry__tabs">
				</div>

				<div className="libraryEntry__content">
					<p>Context: { this.props.entry.context }</p>
					<p>Source: { this.props.entry.source }</p>
					<p>Author: { this.props.entry.author }</p>
					<p>Notes: { this.props.entry.notes }</p>
					<button onClick = { () => this.setState({ showEntryForm: true }) }>Edit</button>
				</div>

				<p>Choose which list this entry should be in</p>
				<select value={ this.props.entry.entry_list } onChange={ (e) => { this.actionUpdateEntry({ entry_list: e.target.value }) }}>
					<option value="0">None</option>
					<option value="1">Learning</option>
					<option value="2">Mastered</option>
					<option value="3">Archived</option>
				</select>

				<button onClick={ () => this.actionDeleteEntry() }>Delete entry</button>

				{ this.props.entry.favourites
					? <button onClick={ () => { this.actionUpdateEntry({ favourites: false }) }}>Remove from favourites</button>
					: <button onClick={ () => { this.actionUpdateEntry({ favourites: true }) }}>Add to favourites</button>
				}

				{ this.state.showEntryForm ? <div className="modal">
					<div className="modal__content">
						<WordEntryForm 
							inputValues={ { context: this.props.entry.context, source: this.props.entry.source} }
							save={ (event) => this.actionUpdateEntry(event) }
						/>
					</div>
				</div> : null }

				{ this.state.showWordDetails && this.state.wordEntryDetails
					? <div><WordEntry entry={ entry } /></div>
					: null }

			</div>
		)
	};

	loadWordDetails = async () => {
		const wordKey =`entryDetails${this.props.entry.word}`
		await secureFetch(`v1/words/search?q=${ this.props.entry.word }`).then(result => {
				this.setState({ wordEntryDetails: result.data });
			}).catch(error => {
				console.log({ error });
			})
		this.setState({ showWordDetails: true });
	}

	actionUpdateEntry = async (event) => {
		const fields = { ...event };
		await secureFetch(`v1/entries/${this.props.entry.id}/update`, 'POST', fields).then(result => {
			this.setState({ showEntryForm: false });
			this.props.update();
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


