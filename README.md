# LinguiLearn


## Introduction


## Distinctiveness and Complexity
This app is distinct from the projects submitted for CS50W 2020 in the following ways:
- This app is a complete ReactJS single page application. The only pages that are served by python-django are the login and register pages. The rest of the application 'pages' are mounted into a single DOM element. The main App component contains conditional rendering of the views (or 'pages'), and child components are used extensively. Data is retrieved from the backend via asynchronous API calls.
- What makes this project distinct is that it uses two different external API's to perform important transformations that are at the core of this application. When a user searches for a word, the Oxford API is first used to find the lemma of a word. A lemma is the word you find in the dictionary. For example, one would not find words in their plural form in the dictionary. Next, the WordsAPI is used to retreive information about this word, for example: definitions, synonyms, examples, dirivatives, part of speech, etc. 
- To speed up future searches, whenever a lemma is found which also returns information from WordsAPI, the response data is parsed into the structure that my API will serve to the front end, and then effectively 'cached' in the 'local' database as a JSON string. So, even if a user does not choose to save the entry in their library, this data is still available in the database if any user searches for it in the future. I have found that this drastically improves the loading time of results.

- I created a 'wrapper' function for the standard javascript 'fetch' which intercepts responses and, for example, handles a 401 error generically. This wrapper sets the headers, method, csrftoken and stringifies the body, so any fetch from react just has to provide the url, method, and post body if there is any.
- I learned about async/await and used it where I required to await something before carrying on.
- I added a CDN for using feather icons and learnt about svg styling and how to reload feather icons in React JSX.
- The user is able to filter their vocabulary library, add entries to lists, choose how to order the entries, and also choose how many entries to show per page.


### Backend / Architecture
- For this project, I have split my views into many 'modules' to separate 'topics'. I learnt how to use an __init__.py file to bundle these modules into one.
- I learnt how to raise custom exceptions when writing 'helper' functions so that these can be handled by the view function in a generic way.
- Using of decorators  / middleware. To reduce repetition of code I created my own decorator to serve as middleware for all api endpoints that require authentication. I also imported a django decorator that checks for which http methods are allowed on a given endpoint.
- I created a config file to store information like external api information
- For this project I also learnt and implemented 'Managers' for some of my models. This keeps a lot of logic out of the view functions, and I have found it very useful. For example, quering list data with filters and pagination parameters can be easily implemented; updating an object can be done better; etc.
- I also started using more model methods to perform certain 'row-level' functions.
- Extensive testing with Pretty logging via external packages... 

## Project structure / Files

### Views Directory
For this project, I split my views into 'modules' and created some additional files:
1. __init__.py: Imports / bundles all the views
2. users.py
3. words.py
4. entries.py
5. config.py
6. my_decorators.py

### Django App Files I created / modified in
1. urls.py
2. models.py
3. tests.py
4. settings.py









Play Learn Love Lingo! A simple app where you can improve and build your English vocabularly. Connect with friends to see their favourite vocab additions and progress. Master words through various interactive learning games.


## Stack
- Python3
- Django
- Django-models
- Django-projects
- Javascript
- React components with JSX
- HTML
- SASS / CSS
- REACT

## External services
- Oxford Dictionaries API
- WordsAPI


## Installed packages
- django-friendship
- django-nose
- requests
- pinocchio

## Dev mode
python3 manage.py runserver

## CSS / Sass
And in `lingiulearn/static/linguilearn`:
`sass --watch styles.sass styles.css`

## Testing
python3 manage.py test -s

