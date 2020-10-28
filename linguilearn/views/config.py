def services_setup():
	return {
		"words_api": {
			"headers": {
				'x-rapidapi-host': "wordsapiv1.p.rapidapi.com",
				'x-rapidapi-key': "%API_KEY%"
			},
			"base_url": "https://wordsapiv1.p.rapidapi.com/words/"
		},
		"oxford_api": {
			"headers": {
				"app_id": "%API_ID%",
				"app_key": "%API_KEY%"
			},
			"base_url_lemmas": "https://od-api.oxforddictionaries.com/api/v2/lemmas/en/",
			"base_url_entries:": "https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/"
		}
	}