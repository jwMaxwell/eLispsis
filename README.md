# eLispsis
## Installation
This interpreter has a few dependencies, mainly NodeJS. You will need to be sure that you have NodeJs and npm installed
on your machine before coninuing to the first step. If you don't know how to do this, Google it.
Once you have NodeJS and npm, you can clone this repository and install the remaining depencies as follows:
```bash
$ git clone https://github.com/jwMaxwell/eLispsis.git
$ cd eLispsis
$ npm install
```

## Getting started
This interpreter does not have a built-in REPL and so you will either need to implement it yourself, or preferably, you can
run the REPL program included in the library. Once this starts, you can test and make sure everything works.
```bash
$ node main.js library/repl.el 
eLispsis... (print "Hello, world!")
Hello, world!
```

Now that you got everything working, you can begin writing your very own programs! Reference material can be found
in the project wiki, including a basic tutorial, code examples, and every function you need.
