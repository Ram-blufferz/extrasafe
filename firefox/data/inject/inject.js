
var globalNoInputFields = 0;

//Jquery function to insert master password fields in the web page (DOM modifications).
//It sees for the input type password and inserts the new master password div into the body.
//The master password div contains the master password input field, show password icon, Extrasafe icon.
function inject(){
	$("input[type='password']").each(function(){
		globalNoInputFields++;

		//get the original password position in order to show the new master password div in correct position below the original password.
		var originalPassword = $(this);
		var passwordPosition = originalPassword.offset();
		var passwordHeight = originalPassword.outerHeight(true);

		var masterPasswordDiv = $('<div class=extrasafeMasterPasswordDiv style="top:'+(passwordPosition.top+passwordHeight+5)+'px; left:'+passwordPosition.left+'px ">');
		var masterPasswordField = $('<input type="password" class="extrasafeMasterPassword" id="master_password" inputField="'+globalNoInputFields+'" placeholder="Master Password" ></input>');
		var images = $('<span class="images"></span>');
		var showPassword = $('<img class="extrasafeUnmask" src="'+self.options.unmaskPng+'"></img>');
		var extrasafeIcon = $('<img class="extrasafeIcon" src="'+self.options.extrasafePng+'"></img>');
		
		images.append(showPassword);
		images.append(extrasafeIcon);

		//When user clicks outside the master password div, master password div should hide
		masterPasswordDiv.focusout(function(){
			masterPasswordDiv.hide();
		});

		//User can press enter in login forms for auto submit (or) can click outside to continue with other input fields.
		//On users key up event on master password field,
		//	check for whether enter is pressed -> Send the master password to background, hide the master password div, submit the login form.
		//	If master password is empty then clear the original password field also.
		//	For all other key ups send the master password to background.
		//Reason for key up is its called after key pressed actions (eg clearing does not work properly on other key events).
		masterPasswordField.keyup(function(e){
			if(e.keyCode == 13){
				self.port.emit("master password",{ masterPassword: $(this).val(), fromInputField: masterPasswordField.attr('inputField') });
				masterPasswordDiv.hide();
				originalPassword.closest("form").submit();
			}
			if(masterPasswordField.val() == ""){
				originalPassword.val("");
			}
			else{
				self.port.emit("master password",{ masterPassword: $(this).val(), fromInputField: masterPasswordField.attr('inputField') });
			}
		});

		//If user mouse enters over the master password show password, change the input type to text.
		showPassword.mouseenter(function(){
			masterPasswordField.attr('type','text');
		});

		//If user mouse leaves over the master password show password, change the input type to password.
		showPassword.mouseleave(function(){
			masterPasswordField.attr('type','password');
		});

		//Append all the fields and icons to master password div and hide it initially.
		masterPasswordDiv.append(masterPasswordField);
		masterPasswordDiv.append(images);
		masterPasswordDiv.hide();

		//This function shows the master password div.
		var toggleFocus = function(){
			masterPasswordDiv.show();
			masterPasswordField.focus();
		}
		
		//Initially bind the focus event with toggleFocus function.
		$(this).on("focus",toggleFocus);

		//On Users click on page action icon to enable or disable the Extrasafe in current site. The class of original password differs, bind or unbind accordingly.
		$(this).on("classToggled",function(){
			if($(this).hasClass('enableExtrasafe')){
				$(this).on("focus",toggleFocus);
			}
			else if($(this).hasClass('disableExtrasafe')){
				$(this).off("focus");
			}
		});

		//Bind the master password field in body.
		//See the inject.css for the position and !important fields to overcome the web sites css. 
		$(document.body).append(masterPasswordDiv);

		//Add class infomation, and these are initial settings.
		originalPassword.addClass(""+globalNoInputFields);
		originalPassword.addClass('enableExtrasafe');

	});
}

inject();

self.port.on("disable password div", function(message){
	$("input[type='password']:not('.extrasafeMasterPassword')").removeClass('enableExtrasafe');
	$("input[type='password']:not('.extrasafeMasterPassword')").addClass('disableExtrasafe');
	$("input[type='password']:not('.extrasafeMasterPassword')").trigger('classToggled');
});

self.port.on("enable password div", function(message){
	$("input[type='password']:not('.extrasafeMasterPassword')").removeClass('disableExtrasafe');
	$("input[type='password']:not('.extrasafeMasterPassword')").addClass('enableExtrasafe');
	$("input[type='password']:not('.extrasafeMasterPassword')").trigger('classToggled');
});

self.port.on("result", function(message){
	$("."+message.fromInputField).each(function(){
		$(this).val(message.result);
	});
});

//To rerun the DOM modifications on ajax called login/signup forms.
self.port.on("rerun input script", function(message){
	if(!$(".extrasafeMasterPassword").length){
		inject();
	}
});