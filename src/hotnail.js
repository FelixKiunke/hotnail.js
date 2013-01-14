/*
 * IMPORTANT: It is recommended you download hotnail.js at http://hotnailjs.com,
 *            where you can finetune your download with values for your country
 *
 * Offers suggestions when the user mistypes an email address,
 * e.g. jon..doee@@gmil.coom -> john.doe@gmail.com
 *
 * Inspired by Kicksend's Mailcheck (https://github.com/Kicksend/mailcheck), which corrects only
 * domains, a great idea I took a little further ;)
*/
/**
 * hotnail.js (hotnailjs.com) by Felix Kiunke. Version 0.1.2, released under MIT
 */

var hotnail = {
	domains: [],          // Domains like gmail.com, hotmail.com etc.
	tlds: [],             // TLDs like .de, .co.uk etc.
	addresses: [],        // Addresses like info@…, support, mail etc.
	insertMarkers: false, // Insert markers before and after corrections,
	                      // so you can highlight them – see
	                      // http://hotnail.js.com/#docs:hotnail.insertMarkers

	// The actual correction function: takes an email address and optionally a name
	// and returns a suggestion. If name is provided, attempts to correct the part
	// before the email address
	suggest: function(email, name) {
		var i, len, self = this,
			parts, // Email parts (address, domain, tld)
			correctedEmail, // Email with double characters like .. or @@ removed
			atSign, // corrected @, for easier inclusion of markers
			closestDomain, closestTld,
			nameList, correctedName,
			marker1 = "", marker2 = "";

		if (self.insertMarkers) {
			marker1 = "\n"; marker2 = "\r";
		}

		email = email.toLowerCase();

		correctedEmail =
			email.replace(/([._%+-])[._%+-]+/g, marker1 + "$1" + marker2).replace(/@+/g, "@");
		atSign = this.insertMarkers && /@{2,}/.test(email) ? "\n@\r" : "@";

		parts = this.splitEmail(correctedEmail);

		// Invalid email, user is probably still typing
		if (!email || !correctedEmail || !parts)
			return false;

		// Split the name at spaces and other non-letters
		if (name)
			nameList = this.removeUmlauts(name.replace(/^\s+|\s+$/, "").replace(/\s+/, " "))
				.replace(/[^A-Z]/i, " ").toLowerCase().split(" ");

		// Replace the address part
		if (name && nameList.length > 0) {
			//Split address into parts, e.g. j.doe-mail => j, doe & mail
			correctedName = parts.address.replace(
			/([a-zäöüÄÖÜßáàâãåæéèêëíìîïóòôõúùûçñøÁÀÂÃÅÆÉÈÊËÍÌÎÏÓÒÔÕÚÙÛÇÑØ]+)/gi,
			function(comp, match) {
				// TODO: Recognize names like johndoe@… without punctuation etc. in between
				var sugg, orgMatch = match,
					a = "", b = ""; // markers

				if (self.insertMarkers) {
					a = "\n"; b = "\r";
				}

				match = self.removeUmlauts(match.toLowerCase());

				// Account for single letters. If none the letter matches none of the names,
				// The first letter in the name is suggested. Maybe there will be a keyboard
				// proximity function later?
				if (match.length == 1) {
					for (i = 0, len = nameList.length; i < len; i++) {
						if (nameList[i][0].toLowerCase() == match) {
							return self.removeUmlauts(comp, self.insertMarkers);
						}
					}
					// We use \n and \r as markers because they can't be in the input
					return a + nameList[0][0].toLowerCase() + b;
				}

				sugg = self.findClosestItem(match, nameList, null, true) || "";
				sugg = sugg.toLowerCase() || false;

				// If there is a good suggestion for this name part
				if (sugg && sugg != match) {
					// If suggestion matches the part of this match after the first letter
					// (e.g. jdoe@…), look if there is a better first letter (e.g. first name)
					if (sugg == match.slice(1)) {
						// Loop through all names for the first letter
						for (i = 0, len = nameList.length; i < len; i++) {
							// If the first letter is the same…
							if (nameList[i][0].toLowerCase() == match[0]) {
								// If the name from nameList is the matched name,
								// it's likely that the user just typed the letter
								// twice accidentally
								if (nameList[i].toLowerCase() == match.slice(1)) {
									return a + self.removeUmlauts(match.slice(1, 2)) + b +
										self.removeUmlauts(match.slice(2), self.insertMarkers);
								} else {
									// Everything fine – this name exists
									return self.removeUmlauts(comp, self.insertMarkers);
								}
							}
						}
						// The first letter of the match seems to be wrong, so return
						// the first letter of the first name (could later be improved
						// with some keyboard data)
						return a + nameList[0][0].toLowerCase() + b + match.slice(1);
					} else {
						// The surname looks wrong, we check if there's a single letter
						// for the first name by looking if the match is longer than the
						// suggestion
						for (i = 0, len = nameList.length; i < len; i++) {
							// If the name from nameList is the suggested name,
							// the user probably just typed the letter twice and
							// misspelled the part after the letter. This is corrected
							// after this for-loop
							if (nameList[i][0].toLowerCase() == match[0] &&
								nameList[i].toLowerCase() != sugg) {
								return match[0] + a + sugg + b;
							}
						}
						// If the match is longer than the suggestion, there may be a
						// one-letter first name which was mistyped, too
						if (match.length > sugg.length && nameList[0] != sugg) {
							return a + nameList[0][0].toLowerCase() + b + a + sugg + b;
						}

						// If there is no first name letter, just return the suggestion
						return a + sugg + b;
					}
				} else {
					// Everything fine, no better suggestion OR no suggestion found
					// Try with the predefined address parts like info, support, hello, etc.
					sugg = self.findClosestItem(match, self.addresses, .3, true) || "";
					sugg = sugg.toLowerCase() || false;
					if (sugg && sugg != match)
						return a + sugg + b;
					else
						return self.removeUmlauts(comp, self.insertMarkers);
				}
			});
		} else {
			// We have no name information, so just try with the predefined standard address parts
			correctedName = parts.address.replace(
			/([a-zäöüÄÖÜßáàâãåæéèêëíìîïóòôõúùûçñøÁÀÂÃÅÆÉÈÊËÍÌÎÏÓÒÔÕÚÙÛÇÑØ]+)/gi,
			function(comp, match) {
				var sugg;

				match = self.removeUmlauts(match.toLowerCase());
				sugg = self.findClosestItem(match, self.addresses, .3, true) || "";
				sugg = sugg.toLowerCase() || false;
				if (sugg && sugg != match)
					return self.insertMarkers ? "\n" + sugg + "\r" : sugg;
				else
					return self.removeUmlauts(comp, self.insertMarkers);
			});
		}

		// address/name part corrected, now to the domain

		parts.domainNoMarkers = this.removeUmlauts(parts.domain);
		parts.domain = this.removeUmlauts(parts.domain, self.insertMarkers);

		// First try with domains (gmail.com, hotnail … umm … hotmail.com etc.)
		if (this.domains.indexOf(parts.domainNoMarkers) < 0) {

			closestDomain = this.findClosestItem(parts.domainNoMarkers, this.domains, .4, true);
			if (closestDomain)
				return correctedName + atSign + marker1 + closestDomain + marker2;

		} else if (correctedName == parts.address && email == correctedEmail) {
			// Nothing left to correct – name right, domain right, email right!
			return false;
		}

		// Okay, there didn't seem to be a matching domain so let's at least attempt to correct
		// the TLD
		if (parts.tld === false || this.tlds.indexOf(parts.tld) < 0) {
			// Account for misspellings like "gmxde" or "hotmailcom"
			if (parts.tld === false || parts.domain.indexOf(".") < 0) {
				// Try to match a TLD, assuming it is not mistyped
				for (i = 4; i >= 2; i--) {
					closestTld = this.tlds.indexOf(parts.domain.slice(-i));
					if (closestTld >= 0)
						return correctedName + atSign + parts.domain.slice(0, -i) +
							marker1 + "." + marker2 + this.tlds[closestTld];
				}
			} else {
				// Account for "example.dw", "owndomain.infp", etc.
				closestTld = this.findClosestItem(parts.tld, this.tlds, .67, true);
				if (closestTld)
					return correctedName + atSign +
						parts.domain.slice(0, parts.domain.lastIndexOf(".") + 1)
						.replace(/\n\.$/g, "\n.\r") + marker1 + closestTld + marker2;
			}
		}

		// Nothing to correct about domain & TLD or no correction found

		if (correctedName != parts.address)
			return correctedName + atSign + parts.domain;
		else if (correctedEmail != email) {
			if (this.insertMarkers)
				// Don't use "correctedEmail" here because the @ sign should be highlighted here, too
				return email.replace(/([._%+-@])[._%+-@]+/g, "\n$1\r");
			else
				return correctedEmail;
		}

		return false;
	},


	// Distance function:
	// Must return a value between 1 (nothing overlaps) and 0 (same string)
	sift3distance: function(s1, s2) {
		// sift3 distance (slightly modified here to return values between 0 and 1 etc):
		// siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
		var i, c = 0, offset1 = 0, offset2 = 0, lcs = 0,
			maxOffset = Math.ceil((s1.length + s2.length) / 4);

		if (!s1)
			return !s2 ? 1 : 0;

		if (!s2)
			return 0;

		while ((c + offset1 < s1.length) && (c + offset2 < s2.length)) {
			if (s1.charAt(c + offset1) == s2.charAt(c + offset2)) {
				lcs++;
			} else {
				offset1 = 0;
				offset2 = 0;
				for (i = 0; i <= maxOffset; i++) {
					if ((c + i < s1.length) && (s1.charAt(c + i) == s2.charAt(c))) {
						offset1 = i;
						break;
					}
					if ((c + i < s2.length) && (s1.charAt(c) == s2.charAt(c + i))) {
						offset2 = i;
						break;
					}
				}
			}
			c++;
		}

		return Math.abs(1 - lcs / ((s1.length + s2.length) / 2));
	},

	distance: null,

	// Splits an email into address (before @), domain (after @) and TLD
	splitEmail: function(email) {
		var parts = email.split("@"),
			domain, domainParts, tld, address;

		if (parts.length != 2 || email == "@")
			return false;

		address = parts[0];
		domain = parts[1] || ".";
		domainParts = domain.split(".");

		// Allow for TLDs like .co.uk or
		if (domainParts.length > 2) {
			// There are second-level domains with more than three letters
			// like .parliament.uk, but they are rare enough to ignore
			if (domainParts[domainParts.length - 2].length <= 3) {
				tld = domainParts[domainParts.length - 2] + domainParts[domainParts.length - 1];
			}
		} else if (domainParts.length == 2) {
			tld = domainParts[domainParts.length - 1] || "";
		} else if (domainParts.length == 1) {
			// Allow for typos like gmxde or exampleorg
			tld = false;
		} else
			return false;

		if (domain == "." || tld === "" || address == "")
			return false;

		return {
			domain: domain,
			tld: tld,
			address: address
		}
	},

	// Finds the closest item in a list, i.e. the item with the nearest string
	// Since sift3 is not very good with handling swapped letters as in mgx.com,
	// there is a swapLetters parameter here
	findClosestItem: function(str, list, threshold, swapLetters) {
		var i, len, i2, len2, str2, dist, closestItem,
			threshold = threshold || 0.5, minDist = 1;

		for (i = 0, len = list.length; i < len; i++) {
			if (str == list[i])
				return str;

			dist = this.distance(str, list[i]);

			if (dist < minDist) {
				minDist = dist;
				closestItem = list[i];
			}

			if (swapLetters) {
				for (i2 = 0, len2 = str.length - 1; i2 < len2; i2++) {
					str2 = str.slice(0, i2) + str[i2 + 1] + str[i2] + str.slice(i2 + 2);

					dist = Math.max(this.distance(str2, list[i]) + (2 / str.length));

					if (str2 == list[i])
						return str2;

					if (dist < minDist) {
						minDist = dist;
						closestItem = list[i];
					}
				}
			}
		}

		if (minDist <= threshold && closestItem != null)
			return closestItem;
		else
			return false;
	},

	// Not only umlauts, also other special characters
	removeUmlauts: function(text, markers) {
		var a = "", b = "";
		if (markers) {
			a = "\n"; b = "\r";
		}
		return text
			.replace(/[äÄæÆ]/g, a+"ae"+b).replace(/[öÖøØ]/g, a+"oe"+b)
			.replace(/[üÜ]/g, a+"ue"+b).replace(/[áàâãåÁÀÂÃÅ]/g, a+"a"+b)
			.replace(/[éèêëÉÈÊË]/g, a+"e"+b).replace(/[íìîïÍÌÎÏ]/g, a+"i"+b)
			.replace(/[óòôõÓÒÔÕ]/g, a+"o"+b).replace(/[úùûÚÙÛ]/g, a+"u"+b)
			.replace(/[çÇ]/g, a+"c"+b).replace(/[ñÑ]/g, a+"n"+b);
	}
};
hotnail.distance = hotnail.sift3distance;