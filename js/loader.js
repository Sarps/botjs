
var lib_folder = 'lib-noserver/';
var server = true;

var resources = {
    sets: {},
    substitutions: {},
    maps: {},
    system: {},
    aiml:{}
};

var data = '';
var BotLoader = {
    
    load: function(filename, load){
        if(server === true){
            this.server(filename, load);
        } else {
            this.noserver(filename, load);
        }
    },
    
    noserver: function(filename, load){
        var file = document.createElement("script");
        file.src = filename+'.js';
        file.onload = load || function(){}
        document.body.appendChild(file);
    },
    
    server: function(filename, load){
        var xhttp =new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState==4 && this.status==200){
                data = this.responseText;
                load();
            }
        };
        xhttp.open("GET",filename,true);
        xhttp.send();
    },
    
    loadAll: function(){
        var folders = Object.keys(res);
        while(folders.length){
            this.loadFolder(folders.shift());
        }
        this.load_builtin();
    },
    
    loadFolder: function(folder){
        var files = res[folder];
        for(var i=0; i<files.length; i++){
            try { eval("this.load_"+folder+"('"+lib_folder+folder+"','"+files[i]+"')"); }
            catch(e) {console.log(e.toString(), "eval_error");}
        };
    },
    
    load_sets: function(folder, filename){
        this.load(folder+"/"+ filename+".set", function(){
            console.log(filename);
            resources.sets[filename] = (JSON.parse(JSON.stringify(data)));
            data = '';
        });
    },
    
    load_substitutions: function(folder, filename){
        this.load(folder+"/"+ filename+".substitution", function(){
            console.log(filename);
            resources.substitutions[filename] = (JSON.parse(JSON.stringify(data)));
            data = '';
        });
    },
    
    load_maps: function(folder, filename){
        this.load(folder+"/"+ filename+".map", function(){
            console.log(filename);
            resources.maps[filename] = (JSON.parse(JSON.stringify(data)));
            data = '';
        });
    },
    
    load_system: function(folder, filename){
        this.load(filename);
    },
    
    load_aiml: function(folder, filename){
        this.load(folder+"/"+ filename+".aiml", function(){
            console.log(filename);
            resources.aiml[filename] = (JSON.parse(JSON.stringify(data)));
            data = '';
        });
    },
    
    load_builtin: function(){
        resources.sets.number = [
            "[\\+\\-]?(?:\\d+)(?:\\.\\d+)?(?:[eE][\\+\\-]?\\d+)?"
        ];
    }
}

BotLoader.noserver("js/filelist",
    function(){
        alert("");
        BotLoader.loadAll();
        //BotLoader.loadFolder('aiml');
    }
);

