const sg = require('sendgrid').SendGrid(process.env.SG_API_KEY);
const path = require('path');
const Settings = require('../../settings')
const optIn = 'opt-in';

// Send confirmation email to contact with link to confirm email
exports.sendConfirmation = function(req, res, next) {
	const email = req.body.email;

	var helper = require('sendgrid').mail;
	mail = new helper.Mail()
	fromEmail = new helper.Email(Settings.senderEmail, Settings.senderName);
	mail.setFrom(fromEmail)
	mail.setSubject("Please Confirm Your Email Address");

	// Add mail content with success URL
	url = Settings.url + '/success';
	mailText = "Thanks for signing up! Click <a href='" + url + "'>this link</a> \
		to sign up!  This link will be active for 24 hours."
	content = new helper.Content("text/html", mailText);
	mail.addContent(content);
	
	// Add personalizations
	personalization = new helper.Personalization();	
	
	// Add email to personalizations
	to_email = new helper.Email(email);
	personalization.addTo(to_email)
	
	// Add optIn type custom arg personalization
	custom_arg = new helper.CustomArgs("type", optIn);
	personalization.addCustomArg(custom_arg);
	mail.addPersonalization(personalization);
	
	// Add time sent custom arg personalization
	timeSent = String(Date.now());
	custom_arg = new helper.CustomArgs("time_sent", timeSent);
	personalization.addCustomArg(custom_arg);
	mail.addPersonalization(personalization);

	var requestBody = mail.toJSON();
	var request = sg.emptyRequest();
	request.method = 'POST';
	request.path = '/v3/mail/send';
	request.body = requestBody;
	sg.API(request, function (response) {
		console.log(response.statusCode);
		console.log(response.body);
		console.log(response.headers);

		res.sendFile(path.join(__dirname, '../static/check-inbox.html'))	;
	});
}

// Create new contact and add contact to given list
exports.addUser = function(req, res, next) {
	const email = req.body[0].email;
	const emailType = req.body[0].type;
	const timestamp = parseInt(req.body[0].time_sent);
	const listID = Settings.listID;
	const secondsInDay = 86400;
	const timeElapsed = (Date.now() - timestamp) / 1000;

	// Confirm email type is opt in and link has been clicked within 1 day
	if (emailType == optIn && timeElapsed < secondsInDay) {
		// Create new contact
		var request = sg.emptyRequest();
		request.body = [{ "email": email }];
		request.method = 'POST';
		request.path = '/v3/contactdb/recipients';
		sg.API(request, function (response) {
			console.log(response.statusCode);
			console.log(response.body);
			console.log(response.headers);

			// Add contact to list
			var contactID = JSON.parse(response.body.toString()).persisted_recipients[0];
			var request = sg.emptyRequest();
			request.method = 'POST';
			request.path = '/v3/contactdb/lists/' + listID + '/recipients/' + contactID;
			sg.API(request, function (response) {
				console.log(response.statusCode);
				console.log(response.body);
				console.log(response.headers);
				
				res.sendStatus(200);
			});
		});
	} else {
		res.sendStatus(200);
	}
}