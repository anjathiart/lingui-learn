
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
		await secureFetch(`api/friendship/${this.state.toUserEmail}/add`, 'POST')
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
				<p>Definition: { item.definition }</p>
				<p>Part of speech: { item.partOfSpeech }</p>
				{ item.example? <p>Example: { item.example }</p> : null }
				</div>
			)
		});

		return (
			<div className="entry">
				<h1>{ this.props.entry.word }</h1>
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
			wordEntry: '',
			addCustomEntry: false,
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
					<WordEntry entry={ this.state.wordEntry } />
					: null
				}
			</div>
		)
	};

	actionWordSearch = async () => {
		await secureFetch(`api/words/search?q=${this.state.searchInput}`)
		.then(result => {
			this.setState({ wordEntry: result.data });
			this.setState({ showSearchResults: true });
		})
		.catch(error => {
			this.setState ({ addCustomEntry: error.allow || false });
		});
	};
};













