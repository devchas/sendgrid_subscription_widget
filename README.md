# Email Subscription Widget with Double Opt-In

This is an open source repository to add a flexible email subscription widget to any website using [SendGrid](https://sendgrid.com/). After following these directions, you'll be able to add a snippet of HTML to any website that will collect email addresses for your app or business. This widget utilizes [double opt-in](https://sendgrid.com/docs/Glossary/opt_in_email.html) functionality, which means users must confirm their email addresses by clicking an email that is automatically sent to their provided email address.

## Requirements

Before following these instructions, you must:
* Have a SendGrid account - [sign up here](https://sendgrid.com/pricing/)
* Sign up for a [free Heroku account](https://signup.heroku.com/)

## Instructions

### Initial SendGrid Set-up - Create API Key & Contact List
To begin, you will first need to create an API key on SendGrid's website. Once logged in, go to Settings -> API Keys, and click the blue button in the top right corner of the website.  You will be creating a General API key, which must have *Full Access* to *Mail Send* and *Marketing Campaigns*.  Keep this API key in a *safe* and *private* location.  You will need it later.

Next, create a new contact list segment by navigating to Marketing Campaigns -> Contacts, and then clicking the blue button in the top right corner of the page. Once the list is created, you will require the list ID.  You can find this number by navigating to the list and looking at the URL.  The list ID will be the numbers following the last forward slash.  For example, the list ID of a list with URL of https://sendgrid.com/marketing_campaigns/lists/348282 would be 348282.

### Fork this Repository to Create Your Own Copy
If you are unfamiliar with Github, simply click the button that reads *Fork* in the top right of this page. Doing this will provide you with your own copy.  You'll need to change a few basic settings in your copy.

### Deploy to Heroku

**Make sure you Fork this repository before clicking the Deploy to Heroku button below**

Click the button below to deploy this app to the Heroku account you created earlier.  Once complete, locate the URL of your app.  You will need this for the following step.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

Once the app is deployed, you may want to connect your forked Github repository to your Heroku app for easy deployment. You can do this by navigating to the *Deploy* tab within your app on Heroku and following the instructions.

### Update Your App Settings in Your Forked Repository on Github
Navigate to settings.js in your forked copy of the repository and change each of the four variables to the appropriate values. You can find your app's URL by opening your app or navigating to the *Activity* tab in Heroku and scrolling to the middle of the page to the domains section. See the example below.

```javascript
exports.url = 'https://dc-opt-in.herokuapp.com/';
exports.senderEmail = "devin.chasanoff@sendgrid.com";
exports.senderName = "Devin Chasanoff";
exports.listID = 348282;
```

Navigate to the index.html file (server -> static -> index.html) and change the action in the form to reflect your app's URL. Remember to leave "/confirmEmail" at the end. This is the code snippet that you will be embedding in your website. See below for an example.

```html
<form action="https://dc-opt-in.herokuapp.com/confirmEmail" method="post">
	<span>Email: </span>
	<input type="text" name="email" placeholder="hello@example.com" />
	<input type="submit" value="submit" />
</form>
```

*Remember to always re-deploy your app after making any changes.*

### Add API Key as Environmental Variable on Heroku
Next, configure your API key as an environmental variable, which can be done either through Heroku's user interface or the Heroku CLI as shown in [these directions](https://devcenter.heroku.com/articles/config-vars). You must name your variable holding your API key *SG_API_KEY*.

### Create an Event Webhook
The final step is to create an event webhook on SendGrid's website. This will trigger the user being added to your email contact list. In order to set up an event webhook, navigation to Settings -> Mail Settings, and then click on *Event Notification*.  Make sure the toggle in the top left of that section is set to *ON*. Click edit. Enter the root URL of your Heroku app + '/signup'. The following is an example URL: https://dc-opt-in.herokuapp.com/signup. Select *Clicked* below the enter URL area. Then, click the blue check box in the top right corner of the section to save changes.

### Test Your Widget
In order to easily test that your subscription widget is working properly, you may navigate to the root URL of your Heroku app and enter an email that you have access to. If everything is working, you should receive an email with a link to confirm your subscription. Upon clicking this link, the email should be added to the SendGrid contact list you created earlier.

## Usage and Customization

### Usage

In order to use this widget, drop the HTML from the form you altered in the index.html file earlier into any website.

### Customization

You may change the look and feel of the form or create a new one.  The form will continue to work so long as the action is what you specified earlier, the method is post, and there is an input element with name *email*. This widget currently only supports a single field for email.

You may also change the look of the check-inbox.html and success.html files, both of which are located in the static folder with index.html.  These are the pages that users will be directed to upon entering their email and cliking the confirmation link, respectively.

Finally, you may change the content of the confirmation email by changing the *mailText* variable in the contact_list_controller.js file, which is located in the controllers folder. However, be sure to keep the link intact.

```javascript
mailText = "Thanks for signing up! Click <a href='" + url + "'>this link</a> \
	to sign up!  This link will be active for 24 hours."
```
 