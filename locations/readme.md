Locations
=========
The locations.json contains common email providers, top-level domains and address parts for some countries, which are used in the [download section](http://hotnailjs.com#download) of the website.

The data is used for the corrections, and it is recommended that you use email providers, top-level domains and address parts most used in your country, so hotnail.js doesn't suggest e.g. gmx.de for US sites

The format is:
```
{
	"country code": {
		name: "Countries’ name",
		domains: [],   // Array of email provider domains in the format “hotmail.com”
		tlds: [],      // Array of common top-level domains like “co.uk” (without leading dot)
		addresses: [], // Array of common words in addresses like “info”, “webmaster” etc.
	}
}
```

**Your contributions are welcome! :)**