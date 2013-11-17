# generator-cordojo [![Build Status](https://secure.travis-ci.org/chrisfelix82/generator-cordojo.png?branch=master)](https://travis-ci.org/chrisfelix82/generator-cordojo)

A generator for [Yeoman](http://yeoman.io).


## Getting Started

### What is Yeoman?

Trick question. It's not a thing. It's this guy:

![](http://i.imgur.com/JHaAlBJ.png)

Basically, he wears a top hat, lives in your computer, and waits for you to tell him what kind of application you wish to create.

Not every new computer comes with a Yeoman pre-installed. He lives in the [npm](https://npmjs.org) package repository. You only have to ask for him once, then he packs up and moves into your hard drive. *Make sure you clean up, he likes new and shiny things.*

```
$ npm install -g yo
```

### Yeoman Generators

Yeoman travels light. He didn't pack any generators when he moved in. You can think of a generator like a plug-in. You get to choose what type of application you wish to create, such as a Backbone application or even a Chrome extension.

To install generator-cordojo from npm, run:

```
$ npm install -g generator-cordojo
```

To install cordova cli, run:

```
$ npm install -g cordova
```

### What is it?
Now that you have installed Mr. cordojo, you may be wondering what he can do for you.  cordojo is a friend if you would like to do the following:

1. Create a cordova project based on dojox/app

2. Use Node.js as an option for your backend

3. Rapidly develop and test code with automatic build optimization - forget hand crafting dojo build profiles!

### Steps

Create a new cordova project with the usual command.

```
$ cordova create MobileProject
$ cd MobileProject
```

Next add a platform. In our case we add ios

```
$ cordova platform add ios
```

Now let's test that the app runs in Chrome for instance.  You may have to run these commands with sudo.  Go to http://localhost:8000/ios/www/index.html and you should see the default index.html.

```
$ cordova build
$ cordova serve
```

So far nothing new.  If you're like me though, you will find it a pain to have to issue cordova prepare each time you make a change in order to test on the browser. Not to mention I am lazy and hate to have to click the refresh button each time.  Also to add to my frustrations, I have to do a cordova build each time I want to test changes on a device or simulator.  OK I have complained enough, now time to solve all of these issues!

```
$ yo cordojo
```

If you are using Eclipse, you will have to refresh the workspace as files are added in the background.  Also, you will need to create a general project called DojoExpress.  This is because Eclipse is dumb and will not pick up projects added to the workspace automatically.  After that do the following:

```
$ cd ../DojoExpress
$ npm install
$ bower install
```

Refresh the DojoExpress project if using Eclipse.  You will now see that there is a bower_components folder that contains packages defined in bower.json.  You will have to add dojox/app to the dojox folder.  Unfortunately it appears that that folder is empty by default.  You should be able to get a copy from http://dojotoolkit.org/ (I know this is a pain)
After you have added dojox/app.  Do the following to stub out the commonapp directory.  This will be a dojo custom package where you will place all of your app's common code across environments.  As such, it will be placed in the www folder.

```
$ cd ../MobileProject
$ yo cordojo:env common
```

Explore the commonapp custom package.  You will see that it is a simple dojox/app with one template and one view.  See commonapp/config.json for details.
Also, while you are at it, explore DojoExpress.  DojoExpress is a Node.js based Express server that bootstraps Dojo.  This means that you can finally write the exact same code on the front end and the backend!  DojoExpress is pulled in from https://github.com/chrisfelix82/dojoexpress
You should also open DojoExpress/build/mobile.profile.js.  You may be thinking, OK so it is a Dojo build profile, I though you said I didn't have to deal with one of these anymore?  Well that's right you don't, but if you would like to tweak it, you can.  In a few steps, you will see that it gets updated automatically.  Be patient :)

Now we will start up the DojoExpress server, as it will serve the source packages found under bower_components while we develop.  This will help us to debug any javascript code, whether that is our own, or one of the libraries (e.g. dojox).  The server is started by default on port 3434.  Change it in DojoExpress/backend/server.js if you need to.

```
$ grunt start-dojo-express
```

To test that the server is running.  Go to http://localhost:3434 and you should see "Hello World!"

Now we will start the amazing development server.  I say amazing because it will eliminate the need to refresh the browser or restart a devive or simulator when making source code changes. Also, it will monitor http requests, and automatically edit the mobile.profile.js dojo build file.

```
$ grunt dev-serve
```

Now go to http://localhost:8000/ios/www/index.html, and now you will see the SampleView displayed.  Now make a change to the commonapp/sample/SampleView.html file, and you should see the change reflected in the browser without manual refresh needed.
NOTE: If you do not see the auto-refresh occuring, it may be because the hostname you provided earlier is inaccessible for some reason.  You could try changing it to localhost in www/index.html and manually refresh the page once to see future changes reflected automatically - hopefully :)

If you would like the same auto-refresh available on the ios simulator and physical device, then change the following in www/config.xml:

```
<content src="http://<hostname>:8000/ios/www/index.html" />
```

Let's stub out the ios environment as well

```
$ yo cordojo:env ios
```

Now run the emulator to test the auto-refresh.  Again you may need to run with sudo.

```
$ cordova emulate
```

Now here comes the cool part.  Check out DojoExpress/build/mobile.profile.js.  You will see that it has been updated automatically!
Now do a dojo build and inspect the build-report.txt file.  You will see that a layr per view has been created and that it is optimal:

```
$ grunt dojo-build
```

You can copy over the built packages, so that the app can run outside of dev mode.

```
$ grunt copy-files
```

You will see that packages were added called commonapp_built and iosapp_built.  If you would like to switch to the built version, rename these directories by removing _built from them.  Of course, if you are doing this during dev, you would want to name the existing commonapp etc. to something like commonapp_dev.

If you would like to stub out additional views, use:

```
$ yo cordojo:view newViewName
```

You will notice that config.json is also updated automatically.  Have fun coding!

### Getting To Know Yeoman


Yeoman has a heart of gold. He's a person with feelings and opinions, but he's very easy to work with. If you think he's too opinionated, he can be easily convinced.

If you'd like to get to know Yeoman better and meet some of his friends, [Grunt](http://gruntjs.com) and [Bower](http://bower.io), check out the complete [Getting Started Guide](https://github.com/yeoman/yeoman/wiki/Getting-Started).


## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
