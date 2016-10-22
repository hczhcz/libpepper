'use strict';

module.exports = {
    closure: (parent, paramNames, paramModes, impl) => {
        const closure = {
            __type: 'closure',
            parent: parent,
            paramNames: paramNames,
            paramModes: paramModes,
            impl: impl, // ast1, private
            instances: [],

            add: (instance, builder) => {
                // find exist instance

                for (const i in closure.instnaces) {
                    if (
                        closure.instances[i].inits.length
                        === instance.inits.length
                    ) {
                        let ok = true;

                        for (const name of closure.instances[i].inits) {
                            // type checking
                            if (
                                closure.instances[i].modes[name]
                                !== instance.modes[name]
                                || closure.instances[i].types[name]
                                !== instance.types[name]
                            ) {
                                ok = false;
                            }
                        }

                        if (ok) {
                            return closure.instances[i];
                        }
                    }
                }

                // new instance

                closure.instances.push(instance);

                instance.impl = builder(instance, closure.impl);

                return instance;
            },
        };

        return closure;
    },

    instance: (id) => {
        const instance = {
            __type: 'instance',
            id: id,
            inits: [],
            modes: {},
            types: {}, // private
            impl: null, // ast2, set by closure

            addInit: (name, mode, type) => {
                instance.inits.push(name);
                instance.add(name, mode);
                instance.addType(name, type);
            },

            add: (name, mode) => {
                if (instance.modes[name]) {
                    throw Error();
                }

                instance.modes[name] = mode;
            },

            addType: (name, type) => {
                if (!instance.modes[name]) {
                    throw Error();
                }

                if (instance.types[name]) {
                    throw Error();
                }

                instance.types[name] = type;
            },

            accessOut: (name) => {
                if (
                    instance.modes[name] !== 'const'
                    && instance.modes[name] !== 'var'
                ) {
                    throw Error();
                }

                if (!instance.types[name]) {
                    throw Error();
                }

                return instance.types[name];
            },

            accessIn: (name, type) => {
                if (
                    instance.modes[name] !== 'out'
                    && instance.modes[name] !== 'var'
                ) {
                    throw Error();
                }

                if (instance.types[name]) {
                    // type checking
                    if (instance.types[name] !== type) {
                        throw Error();
                    }
                } else {
                    instance.types[name] = type;
                }
            },
        };

        return instance;
    },
};
