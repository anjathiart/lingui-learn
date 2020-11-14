
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
			<div>
				<input placeholder="placeholder"/>
			</div>
		)
	};
};


const WordSearch = class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			'searchInput': 'apples',
		}
	};

	render() {
		return (
			<div className="view flex">
				<p className="mr-2">Type in a word:</p>
				<InputText />
				<button className="button ml-2" onClick={ this.actionWordSearch }>Search</button>
			</div>
		)
	}

	// QUESTION -> is it better to just access `value` from the state within the function?
	actionWordSearch = async () => {
		await secureFetch(`api/words/search?q=${this.state.searchInput}`)
		.then(result => {
			console.log({ result })
		})
		.catch(error => {
			console.log({ error })
		});
	}
};













