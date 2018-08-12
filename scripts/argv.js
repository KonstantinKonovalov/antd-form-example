exports.getArgv = (argv, key) => {
    const index = argv.indexOf(key);
    const next = argv[index + 1];

    return (index < 0) ?
        null :
        (!next || next[0] === '-') ?
            true :
            next;
};
