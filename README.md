# git-also

For a `file` in your git repository prints other files that are most often committed together.

![demo](https://raw.githubusercontent.com/anvaka/git-also/master/docs/demo.gif)

This is a demo of `git-also` applied on three.js library:

```
> src/core/Object3D.js most often committed with:

# together	Similarity	Name
        51	      0.22	src/core/Geometry.js
        48	      0.21	src/renderers/WebGLRenderer.js
        45	      0.19	build/Three.js
        43	      0.18	src/materials/Material.js
        36	      0.15	build/custom/ThreeWebGL.js
        36	      0.15	src/cameras/Camera.js
        35	      0.15	build/custom/ThreeCanvas.js
        34	      0.15	build/custom/ThreeSVG.js
        34	      0.15	build/custom/ThreeDOM.js
        32	      0.14	src/core/BufferGeometry.js
```

This means that file `Object3D.js` is most often committed with `Geometry.js` -
they both appear together in `51` commits! By looking at this output
you can immediately see core pieces of three.js.

The `Similarity` column shows [`Jaccard index`](https://en.wikipedia.org/wiki/Jaccard_index)
of two files.

# usage

Install the package with npm:

```
npm install -g git-also
```

Run it from command line inside your git repository:

```
git also <file>
```

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

Files are often committed together when developers improve code or add new features.
This information could serve as a hint when you are exploring new code:

* What are related file to this file?
* Where else should I look when I fix bugs in this file?

# license

MIT
