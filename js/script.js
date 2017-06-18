
var bot;

function responseCallback(responses, wildcards, userInput){
    var inn = document.getElementById('inner'),
        p = document.createElement('P');
    p.innerHTML = '<b>You</b>: ' + userInput
    inn.appendChild(p);
    for( var i=0; i<responses.length; i++){
        var k = document.createElement('P');
        k.innerHTML ='<b>Me</b>:<i> '+ responses[i] + '<i>';
        inn.appendChild(k);
    }
    console.log(wildcards);
};


window.onload = function(){

    var botConfig = {
        name: 'Sarps',
        age: 1
    };

    
    bot = new BotJS(botConfig, responseCallback);
    
    document.forms[0].onsubmit = function(e){
        e.preventDefault && e.preventDefault();
        bot.respond(this.input.value);
    };
    
};