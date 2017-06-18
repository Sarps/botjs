
//Input Processing - 102
//Pattern Matching - 162
//Tenplate Tags - 217

function BotJS(conf, cb){
    this.variables = {};
    this.wildCards = [];
    this.responses = [[]];
    this.inputs = [];
    this.attributes = conf;
    this.cb = cb || function(text){
        console.log(text);
    }
    this.dom = [];
    for(r in resources.aiml)
    this.dom.push(new DOMParser().parseFromString(resources.aiml[r], "text/xml").documentElement);
    console.log('BotJS is fully loaded!');

};

BotJS.prototype.respond = function(input){
    input = this.cleanString(input);
    if(input == '') return;
    var sentences = this.splitSentence(input);
    var result = []
    for( var i=0; i<sentences.length; i++ ){
        this.wildCards = [];
        var sentence = this.cleanString(sentences[i]);
    if(sentence == '') continue;
        var res = this.findCategory(sentences[i]);
        if(res){
            res = this.cleanString(res);
            result.push([res]);
        }
    }
    this.responses.push(result);
    this.cb(result, this.wildCards, input);
};

BotJS.prototype.findCategory = function(input){
  for(var d=0; d<this.dom.length; d++){
    var categories = this.dom[d].getElementsByTagName('category');
    for(var i=0; i<categories.length; i++){
        var cat = categories[i];
        var text = this.resolvePattern(cat.getElementsByTagName('pattern')[0]);
        if(!this.matchPattern(input, text)) continue;
        if(!this.thatMatches(cat)) continue;
        if(!this.topicMatches(cat)) continue;
        var text = this.fetchTemplate( cat.getElementsByTagName('template')[0]);
        return (text) ? text:"Empty";
    }
  }
  return "End";
}

BotJS.prototype.resolvePattern = function(pattern){
    var nodes = pattern.childNodes;
    var text = '';
    for(var i=0; i<nodes.length; i++){
        switch(nodes[i].nodeName){
            case 'bot':
                text += this.attributes[nodes[i].getAttribute("name")];
                break;
            case 'get':
                text += this.variables[this.getAttribute(nodes[i], "name")];
                break;
            case 'set':
                var key = nodes[i].childNodes[0].nodeValue.toLowerCase(),
                arr = resources.sets[key];
                if(arr && arr.length)
                text += '(' + arr.join('|') + ')';
                else text += '*';
                //Todo: retrieve frm set wildcard /\([A-Z\|]*\)/
                break;
            default:
                text += nodes[i].nodeValue;
                break;
        }
    }
    return text;
}

BotJS.prototype.matchPattern = function(input, pattern){
    var regex =this.replaceWildcard(pattern);
    if(input.charAt(0) != " ") input = " " + input;
    if(input.substr(-1) != " ") input += " ";
    var match = input.match(regex);
    if(match){
        if(match[0].length == input.length){
            this.setWildCards(input, pattern);
            return true;
        }
    }
    else {
        return false;
    }
}


// Input Processing 
BotJS.prototype.replaceWildcard = function(text){
    if( text.charAt(0) != "*") var text = " " + text;
    var modified = text
        .replace(/\s(\*|\_|\^|\#)/g, '$1')
        .replace(/[\*\_]/g, '(\\s[A-Z0-9]+)+')
        .replace(/[\^\#]/g, '(\\s[A-Z0-9]+)*');
    if(text.substr(-1) != "*" || text.substr(-1) != "_" ) modified += '[\\s\?\!\.]*';
    return new RegExp(modified, 'gi');
}

BotJS.prototype.setWildCards = function(input, pattern){
    var replaceArray = pattern.split(/\*|\_|\^|\#/);
    var wildCardInput = input;
    if(replaceArray.length > 1){
        for(var i=0; i<replaceArray.length; i++){
            wildCardInput = wildCardInput.replace(new RegExp(replaceArray[i], 'i'), '|');
        }
        wildCardInput = wildCardInput.split('|');
        for(var i = 0; i< wildCardInput.length; i++){
            if(wildCardInput[i] != '' && wildCardInput[i] != ' ' && wildCardInput != undefined){
                var wildCard = wildCardInput[i];
                try{
                    wildCard.trim();
                    if(wildCard.substr(-1) === '?'){
                        wildCard.pop();
                    }
                } catch(e){
                    console.log(e);
                }
                this.wildCards.push(wildCard);
            }
        }
    }
}

BotJS.prototype.cleanString = function(str){
    return str.trim().replace(/\s+/g, ' ');
}

BotJS.prototype.splitSentence = function(str){
		  return str.split(/[\.\?\!]/);
}

BotJS.prototype.substitute = function(str, cat){
    var map = resources.substitutions[cat];
    var regex = []; 
    for(var key in map) 
        regex.push(key.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")); 
    return str.replace(new RegExp(regex.join('|'),"g"),
        function(m){
            return map[m];
        }
    );
}

BotJS.prototype.normalize = function(str){
    return this.substitute(str, "normal");
}

BotJS.prototype.denormalize = function(str){
    return this.substitute(str, "denormal");
}

// Other Generics
BotJS.prototype.getAttribute = function(node, name){
    var value = node.getAttribute(name);
    if(value) return value;
    value = node.getElementsByTagName(name);
    if(value && value.length) return this.fetchTemplate(value[0]);
    return null;
}

// Pattern Matching

BotJS.prototype.topicMatches = function(category){
    var topic = category.getElementsByTagName('topic');
    if(!topic || !topic.length) topic = category.parentNode;
    else topic = topic[0];
    if (!topic || topic.nodeName != 'topic') return true;
    var name = this.getAttribute(topic, "name");
    return (name == this.variables.topic);
}

BotJS.prototype.thatMatches = function(category){
    var that = category.getElementsByTagName('that');
    if (!that || !that.length) return true;
    that = that[0];
    var m = -1, n = -1;
    var index = this.getAttribute(that, "index");
    if(index){
        index = index.split(',');
        m = (+index[0] || 1)*-1;
        n = (+index[1] || 1)*-1;
    }
    var resp = this.fetchTemplate(that);
    return ( resp == this.responses.slice(m)[0].slice(n)[0]);
}

BotJS.prototype.responseMatches = function(category){
    var response = category.getElementsByTagName('response');
    if (!response || !response.length) return true;
    response = response[0];
    var n = (this.getAttribute(that, "index")) || 1;
    n = (+n)*-1;
    var resp = this.fetchTemplate(response);
    return ( resp == (this.responses.slice(n)[0].join(' ')));
}

BotJS.prototype.inputMatches = function(category){
    var input = category.getElementsByTagName('input');
    if(!input || !input.length) return true;
    //Todo
    
}

BotJS.prototype.fetchTemplate = function(parent){
    var text = '';
    var nodes = parent.childNodes;
    for(var i = 0; i<nodes.length; i++){
        switch(nodes[i].nodeName){
            case 'bot':
                text += this.bot(nodes[i]);
                break;
            case 'get':
                text += this.get(nodes[i]);
                break;
            case 'set':
                text += this.set(nodes[i]);
                break;
            case 'br':
                text += this.br();
                break;
            case 'think':
                text += this.think(nodes[i]);
                break;
            case 'sr':
                text += this.sr();
                break;
            case 'random':
                text += this.random(nodes[i]);
                break;
            case 'star':
                text += this.star(nodes[i]);
                break;
            case 'srai':
                text += this.srai(nodes[i]);
                break;
            case 'condition':
                text += this.condition(nodes[i]);
                break;
            case '#text':
                text += this.text(nodes[i]);
                break;
            case 'li':
                text += this.li(nodes[i]);
                break;
            case 'map':
                text += this.map(nodes[i]);
                break;
            case '#text':
                text += nodes[i].nodeValue;
                break;
            default:
                console.log(nodes[i].nodeName + ' tag, unknown');
                break;
        }
    }
    return this.cleanString(text);
}

// Template tags
BotJS.prototype.random = function(node){
    var random = Math.floor(Math.random()*(node.childNodes.length));
    return this.fetchTemplate(node.childNodes[random]);
}

BotJS.prototype.star = function(node){
    var index = this.getAttribute(node, "index");
    if(index && index <= this.wildCards.length){
        return this.wildCards[index-1];
    }
    return this.wildCards[0];
}

BotJS.prototype.li = function(node){
    return this.fetchTemplate(node);
}

BotJS.prototype.sr = function(){
    return this.findCategory(this.wildCards[this.wildCards.length -1]);
}

BotJS.prototype.think = function(node){
    this.fetchTemplate(node);
    return '';
}

BotJS.prototype.srai = function(node){
    var srai = '' + this.fetchTemplate(node);
    return this.findCategory(srai.toUpperCase());
}

BotJS.prototype.condition = function(node){
    if(!this.getAttribute(node, "name")){
        if(!node.childNodes){
            return '';
        }
        //If condition hasnt got name but children are li n have name n attr
        var child;
        for(var c=0; c<node.childNodes.length; c++){
            child = node.childNodes[c];
            if(child.nodeName === 'li'){
                if(!this.getAttribute(child, "value") || this.variables[this.getAttribute(child, "name") ] === this.getAttribute(child, "value").toUpperCase()){
                    return this.li(child);
                }
            }
        }
    } else if(this. getAttribute(node, "value") ){
        //If has name n attr
        if (this.variables[this. getAttribute(node, "name") ] === this. getAttribute(node, "value").toUpperCase()) {
            return this.fetchTemplate(node);
        }
    } else if(node.childNodes !== undefined){
        //If has name but attr
        var child;
        for(var c=0; c<node.childNodes.length; c++){
            child = node.childNodes[c];
            if(child.nodeName === 'li'){
                if(! this.getAttribute(child, "value") || this.variables[this.getAttribute(node, "name") ] === this.getAttribute(child, "value").toUpperCase()){
                    return this.li(child);
                }
            }
        }
        return "";
    }
    return '';
}

BotJS.prototype.text = function(node){
    return node.nodeValue;
}

BotJS.prototype.br = function(){
    return '\n';
}
    
BotJS.prototype.bot = function(bot){
    return this.attributes[this.getAttribute(bot, "name")] || '';
}

BotJS.prototype.get = function(node){
    return this.variables[this.getAttribute(node, "name")] || '';
}

BotJS.prototype.set = function(node){
    var text = this.fetchTemplate(node);
    this.variables[this.getAttribute(node, "name")] = text;
    return text;
    //Todo: attribute var in set and condition
}

BotJS.prototype.sraix = function(node){
    //(host|botid|hint|apikey|service) * template
}

BotJS.prototype.map = function(node){
    var name = this.getAttribute(node, "name");
    var value = this.fetchTemplate(node);
    return resources.maps[name][value];
}

BotJS.prototype.interval = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.person = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.person2 = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.gender = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.system = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.thatstar = function(node){
    //(TODO|TODO) *
}
BotJS.prototype.topicstar = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.response = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.date = function(node){
    //(TODO|TODO) *
}


BotJS.prototype.learn = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.learnf = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.loop = function(node){
    var parent = node.parentNode;
    while(parent && parent.nodeName != 'condition'){
        parent = parent.parentNode;
    }
    if(parent) return this.condition(parent);
    return '';
}

BotJS.prototype.date = function(node){
    var TODO = this.getAttribute(node, "TODO"),
        timezone = this.getAttribute(node, "timezone"),
        locale = this.getAttribute(node, "locale");
    var today = new Date(), date;
    if(timezone){
        var offset = (today.getTimezoneOffset()/60) + timezone;
        date = new Date(today.getTime() + offset*3600000);
    }
}

BotJS.prototype.explode = function(node){
    return node.childNodes[0].nodeValue.match(/[A-Z0-9]/gi).join(' ');
}

BotJS.prototype.formal = function(node){
    var text = node.childNodes[0].nodeValue.toLowerCase().split( ' ' );
    for ( var i=0; i<text.length; i++)
        text[i] = text[i].charAt(0).toUpperCase() + text[i].slice(1);
    return text.join( ' ' );
}

BotJS.prototype.uppercase = function(node){
    return node.childNodes[0].nodeValue.toUpperCase();
}

BotJS.prototype.lowercase = function(node){
    return node.childNodes[0].nodeValue.toLowerCase();
}

BotJS.prototype.sentence = function(node){
    var text = node.childNodes[0].nodeValue;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

BotJS.prototype.eval = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.id = function(node){
    //(TODO|TODO) *
}

BotJS.prototype.program = function(node){
    //(TODO|TODO) *
}
