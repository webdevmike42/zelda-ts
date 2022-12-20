// curry :: ((a, b, ...) -> c) -> a -> b -> ... -> c
export function curry(fn: Function) {
    const arity = fn.length;

    return function $curry(...args: any[]): any {
        if (args.length < arity) {
            return $curry.bind(null, ...args);
        }

        return fn.call(null, ...args);
    };
}

export const map = curry((fn: Function, functor: any): any => {
    return functor.map(fn);
});