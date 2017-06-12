# Nah

Nah is a simple Node.js version manager. It installs them and switches between
them. That's about it.

I've been a long time user of [nvm](https://github.com/creationix/nvm) and have
been pretty happy with. One thing that has always bugged me however is the
noticeable slowdown it imposes on opening new terminals or just tabs. After
realizing that I don't really use 95% of its features and might as well get
around just by manually symlinking the current Node.js version, I wanted
something to automate the process. And here we are.

## Installation

Nah is distributed as an NPM package which means it needs an existing Node.js
runtime to bootstrap. Install one using your operating system's package manager
or similar.

```bash
$ npm install -g nah
```

Nah stores the currently selected Node.js version symlinked into a special
directory called `current`. Add it to your `$PATH`.

```bash
export PATH="$HOME/.nah/current/bin:$PATH"
```

## Usage

Nah has a concept of channels which correspond to the channels as used by
Node.js. For example, there's a `release` channel for the official builds
intended for end-users or `nightly` which contains snapshots of the current
master branch. There's also `rc` or `chakracore-nightly`. Have a look
[here](https://nodejs.org/download) for the complete list. Nah should be able
to install from any of them as long as the structure of the files is the same.

Anyway, use the channel to specify the Node.js channel if necessary. It
defaults to `release` when omitted.

```bash
$ nah install release/8.1.0
$ nah install 8.1.0
$ nah install 8.1
```

Notice how the version expands. Each missing part of the specified semver is
automatically replaced with a zero. This makes `8` and `8.0.0` equivalent.

It's also possible to ask for the current `latest` version.

```bash
$ nah install nightly/latest
$ node -v
nightly/v9.0.0-nightly20170608d0571a926a
```

To switch versions, use the current command. Without an argument it just prints
the current version and its location.

```bash
$ nah current
• The current version is set to "release/v8.1.0" and located at "/Users/jiripospisil/.nah/versions/release--v8.1.0".

$ nah current 7.9
$ nah current
• The current version is set to "release/v7.9.0" and located at "/Users/jiripospisil/.nah/versions/release--v7.9.0".
```

For all of the available commands, run `nah --help`.

## How it works

Nah stores installed Node.js versions in a directory called `versions`. When
setting a "current" version, it just creates a symlink to the versions
directory.

```
tree -L 2 ~/.nah
.nah
├── current -> /Users/jiripospisil/.nah/versions/release--v8.1.0
├── hooks
│   └── post_install.sh
└── versions
    ├── chakracore-nightly--v9.0.0-nightly20170611cb859bc137
    ├── nightly--v9.0.0-nightly20170608d0571a926a
    ├── nightly--v9.0.0-nightly2017061227cc30aea8
    ├── release--v7.9.0
    ├── release--v8.0.0
    └── release--v8.1.0
```

This means that once the current version is changed, it's changed immediately
everywhere, in every opened shell. Since Nah is distributed as an NPM package,
it's not be available right after installing of a new Node.js version. To solve
this, Nah has a concept of hooks which allow to execute arbitrary shell scripts
each time a new version is installed.

```
$ cat ~/.nah/hooks/post_install.sh
#!/bin/sh

npm install -g nah
```

This ensures that Nah is always available. Feel free to add any other packages.

## License

ISC
