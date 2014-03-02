Hasher = {

	masterPassword: "", //input master password
	siteTag: "", //site name
	password: "", //output password
	start: 0, //start from triming
	end: 10, //end for triming
	requireSpecialCharacters: true,

	//Call the crypto graphic algorithm.
	hashy: function(){	
						Hasher.password = CryptoJS.SHA3( Hasher.masterPassword + Hasher.siteTag ).toString();
					 },
	//It will be called after the Crypto returns.
	modify: function(){
						Hasher.password = Hasher.password.substr(Hasher.start, Hasher.end);
						if(Hasher.requireSpecialCharacters == true){
							Hasher.addSpecialCharacters();
						}
					},
	//TODO: someother better algorithm.
	addSpecialCharacters: function(){
										var middle = Math.floor((Hasher.start+Hasher.end)/2);
										Hasher.password = Hasher.replaceAt(middle,"@");
										Hasher.password = Hasher.replaceAt(middle+2,"#");
					},
	//Utility Helper method
	replaceAt: function(index, character) {
      										return Hasher.password.substr(0, index) + character + Hasher.password.substr(index+character.length);
										},
	//Single method to call from outside to return the hashed and modified password.
	passy: function(masterPassword, siteTag){ 
												Hasher.masterPassword = masterPassword;
												Hasher.siteTag = siteTag;

												Hasher.hashy();
												Hasher.modify();

												return Hasher.password;
											}

};