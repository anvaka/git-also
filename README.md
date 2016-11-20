# git-also

For a `file` in your git repository prints other files that are most often
committed together.

# usage

Install the package with npm:

```
npm install -g git-also
```

Run it from command line inside your git repository:

```
git also <file>
```

This is a demo of `git-also` applied on three.js library:

![demo](https://raw.githubusercontent.com/anvaka/git-also/master/docs/demo.gif)

If you run it without arguments it prints help:

```
  Usage: git-also [options] <file>

  For a <file> in your git repository prints other files that are most often committed together

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    -c, --count <n>  Print top N other files. N is 10 by default
```

# motivation

Files are often comitted together when developers improve code or add new features.
This information could serve as a hint when you are exploring new code:

* What are related file to this file?
* Where else should I look when I fix bugs in this file?

# license

MIT
