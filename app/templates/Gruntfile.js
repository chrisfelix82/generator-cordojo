var cordova = require("cordova");
var httpProxy = require("http-proxy");
var http = require("http");
var fs = require("fs-extra");


module.exports = function(grunt) {

    var bowerjson = null;
    var dojoModules = new Object();
    var dojoNls = new Object();
    var dojoOtherFiles = new Object();

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            options : {
                livereload: true
            },
            www : {
                files: ['www/**/*','merges/**/*'],
                tasks: ['cordova-prepare',"dojo-prepare"]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('cordova-prepare','Executes cordova prepare',function(){
        var done = this.async();
        cordova.prepare(done);
    });

    grunt.registerTask('dev-serve',['cordova-serve','start-proxy','watch']);

    grunt.registerTask('cordova-serve','Starts the cordova serve server on port 9000',function(){
        //start the cordova serve server on port 9000 instead of 8000.  We will start the proxy server on 8000
        cordova.serve(9000);
    });

    grunt.registerTask('start-proxy','Starts the node http-proxy to smart serve resources at port 8000',function(){
        // Create a proxy server with custom application logic
        bowerjson = grunt.file.readJSON("../DojoExpress/bower.json");
        httpProxy.createServer(function (req, res, proxy) {
            proxyRequestHandler(req,res,proxy);
        }).listen(8000);
    });

    grunt.registerTask('start-dojo-express','Start the DojoExpress server at port 3434',function(){
        grunt.util.spawn({
            cmd: 'node',
            args: ['../DojoExpress/app.js']
        },grunt.task.current.async());
    });

    grunt.registerTask('dojo-prepare','Prepares the dojo build profile',function(){

        var done = this.async();
        //Call proxy to generate build
        var options = {
            host: "localhost",
            port: 8000,
            path: '/proxyappdep/',
            method: 'GET'
        };

        http.request(options, function(res) {
           // console.log('STATUS: ' + res.statusCode);
           // console.log('HEADERS: ' + JSON.stringify(res.headers));
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var dojoBuildDeps = JSON.parse(chunk);
                createDojoBuildProfile(dojoBuildDeps,done);
            });
        }).end();
    });

    grunt.registerTask('dojo-build',"Create a dojox/app build",function(){
        var done = this.async();
        grunt.util.spawn( {
            cmd: 'node',
            args: ['../DojoExpress/bower_components/dojo/dojo.js',
                   'load=build',
                   '--profile',
                   process.cwd() + '/../DojoExpress/build/mobile.profile.js',
                   '--appConfigFile',
                   process.cwd() + '/www/commonapp/config.json',
                   '--release'
                   ]
        },function(err, result){
            grunt.log.success('Dojo Build complete.  See DojoExpress/build/release/build-report.txt for details');
            done();
        });
    });

    grunt.registerTask('copy-files','Copy files',function(){
        var done = this.async();
        //Copy over built app packages
        var appPackages = fs.readdirSync("merges");
        for(var x = 0; x < appPackages.length;x++){
            _copyBuiltAppPackages(appPackages[x] + "app","./merges/" + appPackages[x],true);//true keep src
        }//end for
        _copyBuiltAppPackages("commonapp","./www",true);
        //Copy over dojo files
        var done = this.async();
        //Call proxy to generate build
        var options = {
            host: "localhost",
            port: 8000,
            path: '/proxyappdep/',
            method: 'GET'
        };

        http.request(options, function(res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                var dojoBuildDeps = JSON.parse(chunk);
                for(var key in dojoBuildDeps.dojoOtherFiles){
                    try{
                        grunt.file.copy("../DojoExpress/build/release/" + key,"./www/" + key);
                    }catch(e){
                        console.log("Error copying file",key);
                    }//end try
                }//end for
                for(var key in dojoBuildDeps.dojoNls){
                    try{
                        grunt.file.copy("../DojoExpress/build/release/" + key,"./www/" + key);
                    }catch(e){
                        console.log("Error copying file",key);
                    }//end try
                }//end for
                done();
            });
        }).end();

    });

   // grunt.registerTask('defaclear
   // ult', ['jshint', 'qunit', 'concat', 'uglify']);

   //private methods

   var _copyBuiltAppPackages = function(packageName,builtRoot,keepSrcPackage){
       var suffix = "";
       if(keepSrcPackage){
            suffix = "_built";
       }//end if
       console.log("Packagename",packageName);
       grunt.file.expandMapping([
           "*.*",
           "**/*.*",
           "!**/*/*.uncompressed.js",
           "!**/css/**",
           "!**/*.css"
       ],null,{cwd: "../DojoExpress/build/release/" + packageName}).forEach(function(o){
               console.log(o);
               grunt.file.copy(o.src,builtRoot + "/" + packageName + suffix + "/" + o.dest);
           });
       grunt.file.copy("../DojoExpress/build/release/" + packageName + "/" + packageName + ".css",builtRoot + "/" + packageName + suffix + "/" + packageName + ".css");
   };

   var proxyRequestHandler = function(req,res,proxy){

       if(req.url.indexOf("proxyappdep") > -1){
           console.log("Request to create dojo build profile");
           var body = getAppDeps();
           res.writeHead(200,{
                   "Content-length": body.length,
                   "Content-Type": "application/json"
               });
           res.end(body);
           return;
       }//end if

       var url = req.url.substring(req.url.indexOf("www/") + 4);
       var bowerdep = url.substring(0,url.indexOf("/"));
       //get the top level bower package being requested (if any) from the request
       if(bowerdep in bowerjson["dependencies"]){
          // console.log("Bower file requested",req.url,"mapping to",req.url = "/" + url,"bower dep=",bowerdep);
           //Since this is a bower dependancy, we will place it into the dojo
           processDojoBuildDeps(url);
           req.url = "/" + url;
           proxy.proxyRequest(req, res, {host: 'localhost',port: 3434});
       }else{
          // console.log("Non-bower file requested",req.url);
           proxy.proxyRequest(req, res, {host: 'localhost',port: 9000});
       }//end if
   };

    var getAppDeps = function(){

       var deps = new Object();
       deps.bower = bowerjson;
       deps.dojoModules = dojoModules;
       deps.dojoNls = dojoNls;
       deps.dojoOtherFiles = dojoOtherFiles;
       return JSON.stringify(deps);
    };

    var processDojoBuildDeps = function(dep){
        if(dep.indexOf("?") > -1){
            dep = dep.substring(0,dep.indexOf("?"));
        }//end if
        if(dep.indexOf("deviceTheme") === -1 && dep.indexOf("/nls") === -1 && dep.indexOf(".js", dep.length - 3) !== -1){
            var module = dep.replace(".js","");
            dojoModules[module] = module;
        }else if(dep.indexOf("/nls/") > -1){
            dojoNls[dep] = dep;
        }else{
           dojoOtherFiles[dep] = dep;
           dojoOtherFiles["dojo/dojo.js"] = "dojo/dojo.js";//Always copy dojo.js over
        }//end if
    };

    var createDojoBuildProfile = function(dojoBuildDeps,done){
        //This method is used to create/update the dojo build profile
        //load the existing mobile.profile.js file
        var profileLoc = "../DojoExpress/build/mobile.profile.js";
        var profile = grunt.file.read(profileLoc);
        var projectName = process.cwd().substring(process.cwd().lastIndexOf("/") + 1);

        profile = profile.substring(profile.indexOf("return") + 6,profile.indexOf("};")) + "}";
        profile = JSON.parse(profile);

        //Create the packages section in the config
        var deps = dojoBuildDeps.bower.dependencies;
        for(var key in deps){
           if(key !== "dojo-util" && key !== "util" && !_packageExists(profile,key)){
               console.log("The package is not in build profile, so adding it",key);
               profile.packages.push({"name": key,"location": key});
           }//end if
        }//end for

        //Need to see what app packages have been created as well
        var appPackages = fs.readdirSync("merges");
        for(var x = 0; x < appPackages.length;x++){
            if(!_packageExists(profile,appPackages[x] + "app")){
                profile.packages.push({"name": appPackages[x] + "app","location": "../../" + projectName + "/merges/" + appPackages[x] + "/" + appPackages[x] + "app"});
            }//end if
        }//end for
        //Now add the commonapp package if not there
        if(!_packageExists(profile,"commonapp")){
            profile.packages.push({"name": "commonapp","location": "../../" + projectName + "/www/commonapp"});
        }//end if

        //Now we need to add the dojo/dojo layer include list
        var includeList = profile.layers["dojo/dojo"].include;
        for(var key in dojoBuildDeps.dojoModules){
            if(!_includeExists(includeList,key)){
                includeList.push(key);
            }//end if
        }//end for

        var template = grunt.file.read("../DojoExpress/build/profileTemplate.js");
        template = template.replace("replaceme",JSON.stringify(profile,null,4));
        grunt.file.write(profileLoc,template,{encoding: "utf8"});
        done();

    };

    var _packageExists = function(profile,name){
        for(var x = 0; x < profile.packages.length;x++){
            if(profile.packages[x].name === name){
                return true;
            }//end if
        }//end for
        return false;
    };

    var _includeExists = function(includeList,module){
        for(var x = 0; x < includeList.length;x++){
            if(includeList[x] === module){
                return true;
            }//end if
        }//end for
        return false;
    };

    var _getProjectName = function(){
        return  process.cwd().substring(process.cwd().lastIndexOf("/") + 1);
    }


};