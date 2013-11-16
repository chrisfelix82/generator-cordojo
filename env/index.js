'use strict';
var util = require('util');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var fsextra = require('fs-extra');

var EnvGenerator = module.exports = function EnvGenerator(args, options, config) {
  // By calling `NamedBase` here, we get the argument to the subgenerator call
  // as `this.name`.
  yeoman.generators.NamedBase.apply(this, arguments);

  console.log('You called the env sub-generator with the argument ' + this.name + '.');
  if(!this.name){
      this.name = "common";
  }
};

util.inherits(EnvGenerator, yeoman.generators.NamedBase);

EnvGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // have Yeoman greet the user.
    console.log(this.yeoman);

    var prompts = [
        {
            name: 'appType',
            message: 'What type of app is this (cordova or worklight)?',
            default: "cordova"
        },
        {
            name: 'hostname',
            message: 'What is the hostname of your dev machine?',
            default: "localhost"
        }
    ];

    this.prompt(prompts, function (props) {

        //TODO: Maybe later we could switch to ask if we are creating for cordova or worklight and change these values
        this.appRoot = "www";
        this.envRoot =  "merges";
        this.appName = "index";
        this.cssFileName = this.appName;

        this.hostname = props.hostname;
        this.cssPath = this.appRoot + "/css/" + this.cssFileName + ".css";
        //this.platform = props.platform;
        this.platform = this.name;
        this.appType = props.appType;
        this.defaultCss = this.readFileAsString(this.options.env.cwd + "/" + this.cssPath);
        cb();
    }.bind(this));
};


EnvGenerator.prototype.createEnv = function createEnv() {

    //Create the environment stub
    if(this.platform === "common"){
        //we need to stub out the common environment
        this._createCommonapp();
    }else{
        //create another platform environment
        this._createPlatformapp();
    }//end if
};

EnvGenerator.prototype.cssFiles = function cssFiles() {

    //Create top level css imports
    if(!fs.existsSync(this.appRoot + "/css/common.css")){
        this.write(this.appRoot + "/css/common.css",this.defaultCss);
        this.write(this.cssPath,"@import url('./common.css');\n@import url('../commonapp/commonapp.css');\n");
    }//end if
    if(this.platform !== "common"){
        var currentGlobalCss = this.readFileAsString(this.options.env.cwd + "/" + this.cssPath);
        this.write(this.cssPath,currentGlobalCss + "\n@import url('../" + this.platform + "app/" + this.platform + "app.css');");
    }//end if
};

//private methods

EnvGenerator.prototype._createCommonapp = function createCommonapp(){

    //Create the commonapp directory structure
    var cb = this.async();
    this.mkdir(this.appRoot + "/commonapp");
    fsextra.copy(this._sourceRoot + "/commonapp", this.options.env.cwd + "/" + this.appRoot + "/commonapp",function(err){
        if (err) {
            console.error("Failed to create commonapp dir" + err);
            cb(err);
        }else{
            //Copy index.html
            this.template("_index.html","www/index.html");

            //copy bootstrap file
            if(this.appType === "cordova"){
                this.copy("js/index_cordova.js",this.appRoot + "/js/" + this.appName + ".js");
            }else{
                //TODO: Worklight copy
                console.log("commonapp creation for worklight not yet implemented");
                //fsextra.copy(this.options.env.cwd + "/" + this.appRoot + "/application-descriptor.xml",this.options.env.cwd + "/" + this.appRoot + "/application-descriptor_prod.xml");
                //fsextra.copy(this.options.env.cwd + "/server/conf/worklight.properties",this.options.env.cwd + "/server/conf/worklight_prod.properties");
            }//end if
            cb();
        }//end if
    }.bind(this));

};

EnvGenerator.prototype._createPlatformapp = function createPlatformapp(){

    var dir = this.envRoot +  "/" + this.platform + "/" + this.platform + "app";
    this.mkdir(dir);
    if(this.appType === "cordova"){
        this.template('platformapp/_app.profile.js',dir + "/app.profile.js");
        this.template('platformapp/_package.json',dir + "/package.json");
        this.copy("platformapp/app.css",dir + "/" + this.platform +"app.css");
    }else{
        //TODO: platform creation for worklight
        console.log("Platform creation for worklight not yet implemented");
    }//end if

};



