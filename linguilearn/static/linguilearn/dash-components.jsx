
console.log('hi from components')

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

const AddFriend = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'friendStatus': '',
			'toUserEmail': '',

		}
	};

	render() {
		return (
			<div>
				<input type="text" placeholder="user email address"  value={ this.state.toUserEmail } onChange={ this.handleInput.bind(this) } />
				<button onClick={ this.actionAddFriend.bind(this) } >Search</button>
			</div>

		)
	};

	handleInput = (e) => {
		this.setState({ toUserEmail: e.target.value });
	};

	actionAddFriend = async () => {
		await secureFetch(`v1/friendship/${this.state.toUserEmail}/add`, 'POST')
		.then(res => {

		})
		.catch(error => {
			const msg = error.error;
			this.props.onError(msg);
		})
	};
};


const Profile = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'userName': 'Anja',
			'friendsCount': 2,
			'learningCount': 3,
			'masteredCount': 4,
			'likedCount': 10,
		}
	};

	render() {
		return (
			<div>
				<h1>Anja</h1>
				<p>{ `${this.state.friendsCount} Friends` }</p>
				<p>Lingo: <span>{ `${this.state.learningCount} Learning`}</span><span>{ `${this.state.masteredCount} Mastered`}</span><span>{ `${this.state.likedCount} Liked`}</span></p>
			</div>

		)
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
				<Profile />
				<AddFriend onError={ this.handleError.bind(this) } />
				<p onClick={ this.props.view.bind(this, 'library') }>Library</p>
			</div>
		)
	};

	handleError = (e) => {
		this.setState({ 'error': e });
	};
};


const Words = class extends React.Component {
	render() {
		return (
			<div className="view">
				<h1>TODO</h1>
			</div>
		)
	};
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
				{ this.state.addCustomEntry ? <button>Add Custom Entry?</button> : null }
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
	}

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
		await secureFetch(`v1/entries/${this.state.wordId}/add`, 'POST', fields)
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
		}
	};

	async componentDidMount() {
		//  fetch users library
		await secureFetch(`v1/users/${this.props.userId}/library`).then(result => {
			console.log({result})
			this.setState({ list: result.data.list })
		}).catch(error => {
			console.log({error})
		})


		// console.log(this.props.userId)
	}

	render() {
		return (
			<div>
				<h1>Library</h1>
				{ this.state.list.map(entry => {
					return (
						<div className="entry" key={ entry.id }>
							<p>{ entry.word }</p>
						</div>
					)


				})}
			</div>
		)
	};



};







