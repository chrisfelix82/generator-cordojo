'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');

var CordojoGenerator = module.exports = function CordojoGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(CordojoGenerator, yeoman.generators.Base);

CordojoGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  // have Yeoman greet the user.
  console.log(this.yeoman);

  var prompts = [
      {
          name: 'dojoExpressVer',
          message: 'What version of dojoexpress would you like to use?',
          default: "master"
      }
  ];

  this.prompt(prompts, function (props) {
    this.dojoExpressVer = props.dojoExpressVer;
    cb();
  }.bind(this));
};

CordojoGenerator.prototype.copyPackageManagerFiles = function copyPackageManagerFiles() {
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  this.copy('Gruntfile.js','Gruntfile.js');
};

CordojoGenerator.prototype.pullInRemoteProjects = function pullInRemoteProjects() {

    var cb = this.async();
    this.remote('chrisfelix82', 'dojoexpress',this.dojoExpressVer,function (err, remote) {
         if (err) {
             console.log("error pulling in dojoexpress version: ",this.dojoExpressVer,err);
            return cb(err);
         }//end if
        console.log("Success pulling dojoexpress version: ", this.dojoExpressVer);
        remote.directory('../' + this.dojoExpressVer, path.join(this.options.env.cwd, '../DojoExpress'));
        cb();
    }.bind(this),(this.dojoExpressVer === "master"));
};
