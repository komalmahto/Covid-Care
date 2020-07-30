function botVoice(message) {
    const speech = new SpeechSynthesisUtterance();
	if (message==="uplaod"){
		speech.text = "your information has been uploaded successfully and mail has  been sent to central and state health deparment   you will be contacted by the concerned agency on your given phone number  Thankyou for updating other users Please visit nearby covid hospital ";
	}
	speech.volume = 1;
    speech.rate = 0.75;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  
}

document.getElementById("bot").addEventListener("click",function(){
  botVoice("uplaod");
});
