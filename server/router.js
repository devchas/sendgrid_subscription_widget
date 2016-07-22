const ContactList = require('./controllers/contact_list_controller');

module.exports = function(app) {
	app.post('/confirmEmail', ContactList.sendConfirmation);
	app.post('/signup', ContactList.addUser);
}