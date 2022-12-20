// curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
export function curry(fn) {
    const arity = fn.length;
    return function $curry(...args) {
        if (args.length < arity) {
            return $curry.bind(null, ...args);
        }
        return fn.call(null, ...args);
    };
}
export const map = curry((fn, functor) => {
    return functor.map(fn);
});
