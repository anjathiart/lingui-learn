# LinguiLearn
Play Learn Love Lingo! A simple app where you can improve and build your English vocabularly, or even add words that are not part of formal English but that are significant to you. Search for words and add them to your library as entries. Add information to the entries, like context, author, where you found the word, and even write your own notes about this word and what it means to you - with markdown support! Organize your entries into categories for 'learning', 'mastered', 'custom' and 'favourites'.

## Background
As someone who has rediscovered the joys of reading during the lengthy Covid-19 Lockdown that we have all experienced this year, I have been fascinated with all the English words that exist that are unknown to me. Reading on a Kindle allows one to lookup words on the fly, and save them and review them again later. Kindle has a type of Vocabulary Builder tool built in. However, the Kindle interface is not the fastest or most responsive, and I thought having a web / mobile app to gather such a vocabulary library would be great. This gave me the idea to pull in Kindle highlights / notes and bookmarked words into an app via an API. To my disappointment, I quickly found out that such an API does not exist. So for this course's final capstone, I decided to build an app where words can be discovered, searched for, and added to a library for reference.

The scope of features one could come up with for such an app are vast. For this project submission, I decided the main focus would be to have an app that provides one single place to search for words' definitions, get examples, synonyms, and ohter information about the word, and then have the option to store that word as an entry in one's personal library. I found that many of the interesting words I have come accross are not necessarily recognized as formal English, so there is also the feature to add sucn words as 'custom entries' to one's library. Each entry in the library can be customized, beyond the defintions and information offered by the app. Information such as context (for example the sentence in which one came across the word), source (eg. the article / book) and author can be added to the Entry. The user canalso write notes (with markdown support) about the word, and is thus not limited by the standard dictionary provided definitions and use-cases. An entry can be categorizes as being 'learnt' ('learning') or being 'mastered'. Entries can also be starred as favourites, and so on. 

## Stack
- Python3
- Django & Django-models
- Javascript
- React JSX
- HTML
- SASS / CSS

## External services
- Oxford Dictionaries API
- WordsAPI

## Distinctiveness, complexity and design
In summary, this project is distinct from previous projects because:
- It is an interactive learning tool that is customized to the user's preferences.
- It is a fun tool to build vocabulary and keep a library as reference.
- The app uses two external API services, Oxford Dictionary API and Words API to transform a searched word to its lemma and then retrieve data related to the word.
- The app is fully mobile responsive

With regard to complexity, I focussed on better code design and implementation. I wanted to learn more about Model Managers, 'middleware', react SPA and using external services.

### On the backend

**Word searching**
- Two external API's are used to perform important transformations and data retreival which are at the core of this application. When a user searches for a word, the Oxford API is first used to find the lemma of a word. A lemma is the word you find in the dictionary. For example, one would not find words in their plural form in the dictionary. Next, the WordsAPI is used to retreive information about this word, for example: definitions, synonyms, examples, dirivatives, part of speech, etc. This is all done in the backend, using the 'requests' package.
- Making requests to these services, as well as parsing the results into the format that it should be saved and served to the front end, was wrapped in separate functions, thereby allowing the implementation to be changed easily in future wihtout changing the view 'endpoint' function.
- Any response / request errors thrown by these external APIs are checked and then custom exceptions are raised that can be dealt with in the context of the application API before sending the response to the front end.


**Improving performance**
To speed up future searches, whenever a lemma is found which also returns information from WordsAPI, the response data is parsed into the structure that my API will serve to the front end, and then effectively 'cached' in the 'local' database as a JSON string. So, even if a user does not choose to save the entry in their library, this data is still available in the database if any user searches for it in the future. I have found that this drastically improves the loading time of results.

**Middleware / decorators**
To reduce repetition of code I created my own decorator to serve as middleware for all api endpoints that require authentication. I also imported a django decorator that checks for which http methods are allowed on a given endpoint.

**Separating out business logic from views into the models using model methods and model managers**
Model Managers are used to move some of the  logic out of the view functions. For example, quering list data with filters and pagination parameters can be easily implemented; updating an object can be done better; etc. More row-level methods are also implemented in the models themselves.


**Testing**
For unit testing Django-nose and pinochio packages are used to output the test results in a nicer and more readable way.

### On the Front end (UI / UX)

- This app, except for the login and register pages, is a complete ReactJS single page application. The only pages that are served by python-django are the login and register pages. The rest of the application 'pages' are mounted into a single DOM element. The main App component contains conditional rendering of the views (or 'pages'), and child components are used extensively. Data is retrieved from the backend via asynchronous API calls.

- Async / await is used where certain data must be retreived before progressing to the next code.

- Pagination / data controls (eg. ordering / filtering) is more advanced for this project. The user is able to choose the number of results to show on a page, as well as choose how to order the data, and toggle the order direction. An option to 'shuffle' the list data is also availabe. Various filters are also available.


## Project structure / Files

### Views Directory
The views are separated into different files for each of Auth, Entries, Words, and User related views. These are then 'bundled' using an __init__.py file.
1. `__init__.py`: Imports / bundles all the views.
2. `users.py`: Views to fetch the details of the logged in user information, as well as a user's library

`GET v1/users/current`:

```json
{
   "userId":2,
   "userName":"admin",
   "listCountSummary":{
      "totalCount":22,
      "learningCount":11,
      "masteredCount":4,
      "archivedCount":0,
      "favouritesCount":2,
      "customCount":2
   }
}
```

`GET /v1/users/library?filter=all&page=1&limit=5&order=-created_at`:

```json
{
   "userId":2,
   "filter":"all",
   "data":{
      "prev":false,
      "next":true,
      "num_pages":1,
      "page":"1",
      "limit":"5",
      "order":"-created_at",
      "totalCount":22,
      "learningCount":11,
      "masteredCount":4,
      "archivedCount":0,
      "favouritesCount":2,
      "customCount":2,
      "list":[
         {
            "id":61,
            "word":"fish",
            "context":"",
            "source":"",
            "author":"",
            "url":"",
            "notes":"",
            "notesMarkdown":"<p></p>\n",
            "favourites":false,
            "isCustomWord":false,
            "created":"2020-12-12T17:40:50.908Z",
            "entry_list":"2"
         },
         {
            "id":58,
            "word":"codpiece",
            "context":"",
            "source":"",
            "author":"",
            "url":"",
            "notes":"",
            "notesMarkdown":"<p></p>\n",
            "favourites":false,
            "isCustomWord":false,
            "created":"2020-12-12T06:21:04.277Z",
            "entry_list":"0"
         }
      ]
   }
}
```

3. `words.py`: Views to search for a word. It also contains a few 'control' functions to call external APIs and parse data into local app format. Only one endpoint is exposed to the frontend:

`GET v1/words/searchq=apple`:

```json
{
   "search":"apple",
   "wordId":67,
   "data":{
      "word":"apple",
      "list":[
         {
            "definition":"fruit with red or yellow or green skin and sweet to tart crisp whitish flesh",
            "partOfSpeech":"noun",
            "examples":[
               
            ],
            "derivations":[
               
            ],
            "similarTo":[
               
            ],
            "synonyms":[
               
            ],
            "usageOf":[
               
            ]
         },
         {
            "definition":"native Eurasian tree widely cultivated in many varieties for its firm rounded edible fruits",
            "partOfSpeech":"noun",
            "examples":[
               
            ],
            "derivations":[
               
            ],
            "similarTo":[
               
            ],
            "synonyms":[
               "malus pumila",
               "orchard apple tree"
            ],
            "usageOf":[
               
            ]
         }
      ],
      "syllables":{
         "count":2,
         "list":[
            "ap",
            "ple"
         ]
      }
   }
}
```


4. `entries.py`: Views to add, update and delete an entry. There is also an endpoint to add a custom entry. The only GET method is to retreive an entry:

`GET v1/entries/<int:entry_id>`:

```json
{
   "entryId":56,
   "data":{
      "id":56,
      "word":"bamboozle",
      "context":"",
      "source":"Do androids dream of electric sheep?",
      "author":"Philip K. Dick",
      "url":"",
      "notes":"",
      "notesMarkdown":"<p></p>\n",
      "favourites":false,
      "isCustomWord":false,
      "created":"2020-12-12T06:18:42.265Z",
      "entry_list":"1",
      "details":{
         "word":"bamboozle",
         "list":[
            {
               "definition":"conceal one's true motives from especially by elaborately feigning good intentions so as to gain an end",
               "partOfSpeech":"verb",
               "examples":[
                  "He bamboozled his professors into thinking that he knew the subject well"
               ],
               "derivations":[
                  
               ],
               "similarTo":[
                  
               ],
               "synonyms":[
                  "hoodwink",
                  "lead by the nose",
                  "play false",
                  "pull the wool over someone's eyes",
                  "snow"
               ],
               "usageOf":[
                  
               ]
            }
         ],
         "syllables":{
            "count":3,
            "list":[
               "bam",
               "boo",
               "zle"
            ]
         }
      }
   }
}
```

5. `config.py`: Tooling for external services / APIs.
6. `my_decorators.py`: Custom decorator for checking user authorisation on a restricted api endpoint.

### Django App Files I created / modified
1. `urls.py`: URL mapping for the application for fetching HTML and API endpoints.
2. `models.py`: Contains all the models for this application, as well as Managers for some of the models.
3. `tests.py`: Contains a few unit tests split into different classes.
4. `settings.py`: I added some information to this file for django-nose logging.
5. `requirements.txt`: List of all packages used by the application

### Templates
These files are very similar to previous projects (`login.html`, `register.html`, `layout.html`). The difference is that `index.html` contains only one `<div>` where the React App is mounted.

### Static
1. `linguilearn.jsx`: Contains the main App React component and the intitial code to run / start the app. Various 'views' are shown / hidden based on the user's interaction and app state.
2. `dash-components.jsx`: All children components are in this file. These include:
  - SideBar: Component which consists of the library navigation links / filters and the search form.
  - Pagination
  - WordEntry: Word information that was retreived / created by the app itself by calling the external dictionary services are rendered nicely inside this component. This component is used both when a word is searched for, and when a entry in the library is viewed, to display the word details.
  - LibraryEntry: This component displays all the custom information a user has added to their entry as well as the WordEntry component with the word details.
3. `utils.jsx`: Contains the wrapper function used to do requests (proxy for javascript `fetch`).
  - A 'wrapper' function for the standard javascript 'fetch' is included in a utils file. This function intercepts responses and, for example, handles a 401 error generically. This wrapper sets the headers, method, csrftoken and stringifies the body, so any fetch from react just has to provide the url, method, and post body if there is any.
4. `styles.sass`: Stylesheet written in Sass markup.
5. `styles.css`: Stylesheet compiled from the sass stylesheet.


# Thank you
I have had a lot of fun building this project. And, it is an app I'm already using for myself! It is very rewarding building an app based on a need you have yourself.

Thank you to all the staff contributing to CS50W 2020. I have enjoyed this course and building all the problems immensely. And, I look forward to the next one.

