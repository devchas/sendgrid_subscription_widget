const sg = require('sendgrid')(process.env.SG_API_KEY);
const path = require('path');
const Settings = require('../../settings');
const optIn = 'opt-in';

function prepareEmail(emailBody) {
	const senderEmail = Settings.senderEmail;
	const senderName = Settings.senderName;
	const recipientEmail = emailBody.email;
	const firstName = emailBody.firstName;
	const lastName = emailBody.lastName;
	const subject = "Please Confirm Your Email Address";
	const url = Settings.url + '/success';
	const mailText = "Thanks for signing up! Click <a href='" + url + "'>this link</a> to sign up!  This link will be active for 24 hours.";
	const timeSent = String(Date.now());

	return {
	  "personalizations": [
	    {
	      "to": [
	        {
	          "email": recipientEmail,
	        }
	      ],
	      "subject": subject,
	      "custom_args": {
	      	"firstName": firstName,
	      	"lastName": lastName,
	      	"type": optIn,
	      	"time_sent": timeSent,
	      },
	    },
	  ],
	  "from": {
	    "email": senderEmail,
	    "name": senderName,
	  },
	  "content": [
	    {
	      "type": "text/html",
	      "value": mailText,
	    }
	  ]
	}
}

function send(toSend) {
	return new Promise(function(resolve, request) {
		var requestBody = toSend
		var emptyRequest = require('sendgrid-rest').request
		var requestPost = JSON.parse(JSON.stringify(emptyRequest))
		var isEmailSent;
		requestPost.method = 'POST'
		requestPost.path = '/v3/mail/send'
		requestPost.body = requestBody
		
		sg.API(requestPost, function (error, response) {
	    	console.log(response.statusCode)
	    	console.log(response.body)
	    	console.log(response.headers)

			if (response.statusCode >= 200 && response.statusCode < 300) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
}

// Send confirmation email to contact with link to confirm email
exports.sendConfirmation = (req, res, next) => {
	send(prepareEmail(req.body)).then(function(response) {
		if (response) {
			res.sendFile(path.join(__dirname, '../static/check-inbox.html'));
		} else {
			res.sendFile(path.join(__dirname, '../static/error.html'));
		}
	}, function(err) {
		console.log(err);
	});
}

// Create new contact and add contact to given list
exports.addUser = function(req, res, next) {
	var isUserAdded = addUserToList(req.body[0]);

	if (isUserAdded) {
		res.sendStatus(200);
	} else {
		res.sendStatus(500);
	}
}

function addUserToList(emailBody) {
	const email = emailBody.email;
	const firstName = emailBody.firstName;
	const lastName = emailBody.lastName;
	const emailType = emailBody.type;
	const timestamp = parseInt(emailBody.time_sent);
	const listID = Settings.listID;
	const secondsInDay = 86400;
	const timeElapsed = (Date.now() - timestamp) / 1000;

	// Confirm email type is opt in and link has been clicked within 1 day
	if (emailType == optIn && timeElapsed < secondsInDay) {
		// Create new contact
		const requestBody = [{ 
			"email": email,
			"first_name": firstName,
			"last_name": lastName, 
		}];

		var emptyRequest = require('sendgrid-rest').request
		var requestPost = JSON.parse(JSON.stringify(emptyRequest))
		requestPost.method = 'POST'
		requestPost.path = '/v3/contactdb/recipients'
		requestPost.body = requestBody
		sg.API(requestPost, function (error, response) {
	    	console.log(response.statusCode)
	    	console.log(response.body)
	    	console.log(response.headers)

			// Add contact to list
			var contactID = JSON.parse(response.body.toString()).persisted_recipients[0];			
			var emptyRequest = require('sendgrid-rest').request
			var requestPost = JSON.parse(JSON.stringify(emptyRequest))
			requestPost.method = 'POST'
			requestPost.path = '/v3/contactdb/lists/' + listID + '/recipients/' + contactID;
			sg.API(requestPost, function (error, response) {
		    	console.log(response.statusCode)
		    	console.log(response.body)
		    	console.log(response.headers)
				
				if (response.statusCode == 202 || response.statusCode == 200) {
					return true;
				} else {
					return false;
				}
			});
		});
	} else {
		return false;
	}
}