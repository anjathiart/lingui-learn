def services_setup():
	return {
		"words_api": {
			"headers": {
				'x-rapidapi-host': "wordsapiv1.p.rapidapi.com",
				'x-rapidapi-key': "c4b0e1fad4msh7fa19ad9a64e1bap161e40jsn40f34eb31dcb"
			},
			"base_url": "https://wordsapiv1.p.rapidapi.com/words/"
		},
		"oxford_api": {
			"headers": {
				"app_id": "4a7b8083",
				"app_key": "09fd090f4447176a113d44ca173d445b"
			},
			"base_url_lemmas": "https://od-api.oxforddictionaries.com/api/v2/lemmas/en/",
			"base_url_entries:": "https://od-api.oxforddictionaries.com/api/v2/entries/en-gb/"
		}
	}