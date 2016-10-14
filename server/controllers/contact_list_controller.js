const sg = require('sendgrid')(process.env.SG_API_KEY);
const path = require('path');
const Settings = require('../../settings');
const optIn = 'opt-in';

function prepareEmail(reqBody) {
	const subject = "Please Confirm Your Email Address";
	const url = Settings.url + '/success';
	const link = "<a href='" + url + "'>this link</a>"
	const mailText = "Thanks for signing up! Click " + link + " to sign up!  This link will be active for 24 hours.";

	var emailBody = {
	  personalizations: [
	    {
	      to: [
	        {
	          email: reqBody.email,
	        }
	      ],
	      subject: subject,
	      custom_args: {
	      	type: optIn,
	      	time_sent: String(Date.now()),
	      },
	      substitutions: {
	      	link_insert: link
	      }
	    },
	  ],
	  from: {
	    email: Settings.senderEmail,
	    name: Settings.senderEmail,
	  },
	  content: [
	    {
	      type: "text/html",
	      value: mailText,
	    }
	  ],
	}

	const templateId = Settings.templateId;
	if (templateId) emailBody.template_id = templateId;

	for (key in reqBody) {
		emailBody.personalizations[0].custom_args[key] = reqBody[key];
	}

	return emailBody;
}

// Send confirmation email to contact with link to confirm email
exports.sendConfirmation = (req, res, next) => {
	var request = sg.emptyRequest({
		method: 'POST',
		path: '/v3/mail/send',
		body: prepareEmail(req.body)
	});

	sg.API(request, function(error, response) {
		if (error) {
			console.log('Error response received');
		}
		console.log(response.statusCode);
		console.log(response.body);
		console.log(response.headers);

		if (response.statusCode >= 200 && response.statusCode < 300) {
			res.sendFile(path.join(__dirname, '../static/check-inbox.html'));
		} else {
			res.sendFile(path.join(__dirname, '../static/error.html'));
		}
	});
}

// Create new contact and add contact to given list
exports.addUser = function(req, res, next) {
	addUserToList(req.body[0], function() {
		res.sendStatus(200);
	});
}

function addUserToList(emailBody, callback) {
	console.log(emailBody);

	var ignoreFields = ['ip', 'sg_event_id', 'sg_message_id', 'useragent', 'event',
		'url_offset', 'time_sent', 'timestamp', 'url', 'type'];

	var customFields = [{}];

	for (key in emailBody) {
		if (!stringInArray(key, ignoreFields)) {
			customFields[0][key] = emailBody[key];
		}
	}
	
	const email = emailBody.email;
	const firstName = emailBody.firstName;
	const lastName = emailBody.lastName;
	const favoriteColor = emailBody.favoriteColor;
	const emailType = emailBody.type;
	const timestamp = parseInt(emailBody.time_sent);
	const listId = Settings.listId;
	const secondsInDay = 86400;
	const timeElapsed = (Date.now() - timestamp) / 1000;

	// Confirm email type is opt in and link has been clicked within 1 day
	if (emailType == optIn && timeElapsed < secondsInDay) {
		var request = sg.emptyRequest({
			method: 'POST',
			path: '/v3/contactdb/recipients',
			body: customFields
		});

		sg.API(request, function (error, response) {
	    	console.log(response.statusCode)
	    	console.log(response.body)
	    	console.log(response.headers)

	    	if (listId) {
				var contactID = JSON.parse(response.body.toString()).persisted_recipients[0];			
				var request = sg.emptyRequest({
					method: 'POST',
					path: '/v3/contactdb/lists/' + listId + '/recipients/' + contactID,
					body: customFields
				});
				sg.API(request, function (error, response) {
			    	console.log(response.statusCode)
			    	console.log(response.body)
			    	console.log(response.headers)
					
					callback();
				});
			} else {
				callback();
			}
		});
	} else {
		callback();
	}
}

function stringInArray(string, array) {
	var isInArray = false;
	array.map((item) => {
		if (string == item) {
			isInArray = true;
		}
	});
	return isInArray;
}