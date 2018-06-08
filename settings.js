// Change the url to the domain of your app
exports.url = 'https://tn-email-signup.herokuapp.com/';

exports.senderEmail = "support@tradenavigator.com";
exports.senderName = "Trade Navigator";

// set 'exports.listId = null' to add contact to all contacts, but no specific list
// or a string with the listId to add to a specific list
exports.listId = 854819;

// set 'exports.templateId = null' to opt out of using a template
// or a string with the templateId to use a template
exports.templateId = a1e9c893-57f4-4fc6-9073-65bd92ce005e;

// receive an email when a new signup is confirmed
exports.sendNotification = true;
exports.notificationEmail = "jstumpf@tradenavigator.com";
