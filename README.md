# LinguiLearn
Play Learn Love Lingo! A simple app where you can improve and build your English vocabularly, or even add words that are not part of formal English but that are significant to you (custom entries). Search for words and add them to your library as entries. Add information to the entries, like context, author, where you found the word, and even write your own notes about this word and what it means to you - with markdown support! Organize your entries into categories for 'learning', 'mastered', 'custom' and 'favourites'.

## Distinctiveness
This project is distinct from previous projects because:
- It is an interactive learning tool that is customized to the user's preferences.
- It is a fun tool to build vocabulary and keep a library as reference.
- The app uses two external API services, Oxford Dictionary API and Words API to transform a searched word to its lemma and then retrieve data related to the word.
- The app is fully mobile responsive

## Complexity
For this project the complexity I aimed for was mostly in the way my backend is implemented. This includes the following:

### On the backend

#### Word searching
- 	Two external API's are used to perform important transformations and data retreival which are at the core of this application. When a user searches for a word, the Oxford API is first used to find the lemma of a word. A lemma is the word you find in the dictionary. For example, one would not find words in their plural form in the dictionary. Next, the WordsAPI is used to retreive information about this word, for example: definitions, synonyms, examples, dirivatives, part of speech, etc. This is all done in the backend, using the 'requests' package.
- Making requests to these services, as well as parsing the results into the format that it should be saved and served to the front end, was wrapped in separate functions, thereby allowing the implementation to be changed easily in future wihtout changing the view 'endpoint' function.
- Any response / request errors thrown by these external APIs are checked and then custom exceptions are raised that can be dealt with in the context of the application API before sending the response to the front end.


#### Better performance
To speed up future searches, whenever a lemma is found which also returns information from WordsAPI, the response data is parsed into the structure that my API will serve to the front end, and then effectively 'cached' in the 'local' database as a JSON string. So, even if a user does not choose to save the entry in their library, this data is still available in the database if any user searches for it in the future. I have found that this drastically improves the loading time of results.

#### Middleware / decorators
To reduce repetition of code I created my own decorator to serve as middleware for all api endpoints that require authentication. I also imported a django decorator that checks for which http methods are allowed on a given endpoint.

#### Separating out business logic from views into the models
Model Managers are used to move some of the  logic out of the view functions. For example, quering list data with filters and pagination parameters can be easily implemented; updating an object can be done better; etc. More row-level methods are also implemented in the models themselves.

#### Project file / module structure
- A config file is used to store some info related to the external api services
- The views are separated into different files for each of Auth, Entries, Words, and User related views. These are then 'bundled' using an __init__.py file.

#### Testing
For unit testing Django-nose and pinochio packages are used to output the test results in a nicer and more readable way.

### On the Front end (UI / UX)

- This app, except for the login and register pages, is a complete ReactJS single page application. The only pages that are served by python-django are the login and register pages. The rest of the application 'pages' are mounted into a single DOM element. The main App component contains conditional rendering of the views (or 'pages'), and child components are used extensively. Data is retrieved from the backend via asynchronous API calls.

- A 'wrapper' function for the standard javascript 'fetch' is included in a utils file. This function intercepts responses and, for example, handles a 401 error generically. This wrapper sets the headers, method, csrftoken and stringifies the body, so any fetch from react just has to provide the url, method, and post body if there is any.

- Async / await is used where certain data must be retreived before progressing to the next code.

- Pagination / data controls (eg. ordering / filtering) is more advanced for this project. The user is able to choose the number of results to show on a page, as well as choose how to order the data, and toggle the order direction. An option to 'shuffle' the list data is also availabe. Various filters are also available.


## Project structure / Files

### Views Directory
For this project, I split my views into 'modules', created some additional files, and changed a few files:
1. `__init__.py`: Imports / bundles all the views.
2. `users.py`: Views to fetch the details of the logged in user information.
3. `words.py`: Views to search for a word. It also contains a few 'control' functions to call external APIs and parse data into local app format.
4. `entries.py`: Views to add / update / get / delete entries in the user's library
5. `config.py`: Tooling for external services / APIs.
6. `my_decorators.py`: Custom decorator for checking authorisation on an api endpoint.

### Django App Files I created / modified
1. `urls.py`: URL mapping for the application for fetching HTML and API endpoints.
2. `models.py`: Contains all the models for this application, as well as Managers for some of the models.
3. `tests.py`: Contains a few unit tests split into different classes.
4. `settings.py`: I added some information to this file for django-nose logging.
5. `requirements.txt`: List of all packages used by the application

### Templates
These files are very similar to previous projects (`login.html`, `register.html`, `layout.html`). The difference is that `index.html` contains one `<div>` where the React App is mounted.

### Static
1. `linguilearn.jsx`: Contains the main App React component and the intitial code to run / start the app.
2. `dash-components.jsx`: All components used as children are in this file.
3. `utils.jsx`: Contains the wrapper function used to do requests (proxy for javascript `fetch`).
4. `styles.sass`: Stylesheet written in Sass markup.
5. `styles.css`: Stylesheet compiled from the sass stylesheet.


# More information

## Stack
- Python3
- Django
- Django-models
- Django-projects
- Javascript
- React JSX
- HTML
- SASS / CSS

## External services
- Oxford Dictionaries API
- WordsAPI


## Dev mode
`python3 manage.py runserver`

## CSS / Sass
And in `lingiulearn/static/linguilearn`:
`sass --watch styles.sass styles.css`

## Testing
`python3 manage.py test -s`

# Thank you!
Thank you to all the staff contributing to CS50W 2020. I have enjoyed this course and building all the problems immensely.

