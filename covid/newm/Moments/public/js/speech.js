class SpeechRecognitionApi{
        constructor(options){
            const SpeechtoText = window.speechRecognition || window.webkitSpeechRecognition;
              this.speechApi = new SpeechtoText();
              this.output=options.output ? options.output: document.createElement("div");
              this.speechApi.continuous=true;
              this.speechApi.innerimResult=false;
              this.speechApi.onresult=(event) =>{
                  var resultIndex = event.resultIndex;
                  var transcript= event.results[resultIndex][0].transcript;
                  this.output.value+= transcript;
                  console.log(event);
              }

        }
        st(){
            this.speechApi.start();
        }
        stop(){
            this.speechApi.stop();
        }
    }

    window.onload=function(){
        var speech =new SpeechRecognitionApi({
            output: document.querySelector("#messageinp")
        })
        document.querySelector(".btn-start").addEventListener("click",()=>{
           speech.st();
        });
        document.querySelector(".btn-end").addEventListener("click",()=>{
            speech.stop();
         });
    }