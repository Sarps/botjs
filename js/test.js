
var bot = new PhutureBot({name:'WireInterpreter', age:'42'});

var callback = function(answer, wildCardArray, input){
    console.log(answer + ' | ' + wildCardArray + ' | ' + input);
};

var caseCallback = function(answer, wildCardArray, input){
  if (answer == this) {
    console.log(answer + ' | ' + wildCardArray + ' | ' + input);
  } else {
    console.log('ERROR:', answer);
    console.log('   Expected:', this.toString());
  }
};


// Test bot attributes
bot.respond('What is your name?', callback);

// Test setting and getting variable values
bot.respond('My name is Ben.', callback);
bot.respond('What is my name?', callback);

// Test srai tag
bot.respond('Who are you?', callback);

// Test random tag
bot.respond('Give me a letter.', callback);
bot.respond('Test srai in random.', callback);
bot.respond('Test wildcard What is my name?', callback);
bot.respond('Test multiple beautiful wildcards you are', callback);

// Test sr tag
bot.respond('Test sr tag What is my name?', callback);
bot.respond('Test sr in random What is my name?', callback);

// Test star tag
bot.respond('Test the star tag repeat what I said', callback);

// Test that tag
bot.respond('Test the that tag', callback)
bot.respond('Test that-tag. match',callback);
bot.respond('Test that-tag. dont match', callback);

// Test condition tag
bot.respond('What is your feeling today?', callback);
bot.respond('How are you feeling today?', callback);
bot.respond('Tell me about your feelings', callback);
bot.respond("You feel crumpy", callback);
bot.respond('What is your feeling today?', callback);
bot.respond("You feel happy", callback);
bot.respond('How are you feeling today?', callback);
bot.respond('What is your feeling today?', callback);
bot.respond('Tell me about your feelings', callback);
bot.respond("You feel sad", callback);
bot.respond('How are you feeling today?', callback);
bot.respond('What is your feeling today?', callback);
bot.respond('Tell me about your feelings', callback);

// Test wildcards
bot.respond('Explain HANA', callback);

//Test Think tag
bot.respond('I am 123', callback);
bot.respond('How old am I?', callback);
bot.respond('What do you know about me?', callback);

//Test condition and srai
bot.respond('Test condition and srai', callback);
bot.respond("You feel happy", callback);
bot.respond('Test condition and srai', callback);
bot.respond("You feel crumpy", callback);
bot.respond('Test condition and srai', callback);

// Test finding nothing
bot.respond('Test the wildcard pattern!', callback);

// Case insensitive testing
bot.respond('You feel BAD', caseCallback.bind('I feel BAD!'));
bot.respond('You feel good', caseCallback.bind('I feel good!'));
bot.respond('You feel hAPPy', caseCallback.bind('I feel HAPPy!')); // INTENTIONAL ERROR CHECKING
bot.respond('You feel FINEeeeee', caseCallback.bind('I feel FINEEEEEE!')); // INTENTIONAL ERROR CHECKING
