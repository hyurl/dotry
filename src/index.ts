import { isGenerator, isAsyncGenerator } from "check-iterable";

export default dotry;

// Declarations need be ordered from complex to simple.

function dotry<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
    fn: (...args: A) => AsyncGenerator<T, TReturn, TNext>,
    ...args: A
): AsyncGenerator<[E, T], [E, TReturn], TNext>;
function dotry<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
    fn: (...args: A) => Generator<T, TReturn, TNext>,
    ...args: A
): Generator<[E, T], [E, TReturn], TNext>;
function dotry<E = Error, R = any, A extends any[] = any[]>(
    fn: (...args: A) => Promise<R>,
    ...args: A
): Promise<[E, R]>;
function dotry<E = Error, R = any, A extends any[] = any[]>(
    fn: (...args: A) => R,
    ...args: A
): [E, R];
function dotry(fn: Function, ...args: any[]) {
    return dotry.apply(void 0, <any>fn, args) as any;
}

namespace dotry {
    /**
     * Calls a traditional Node.js error-first callback style function and returns
     * a promise wrapped on the result.
     */
    export function promisify<E = Error, R = any, A extends any[] = any[]>(
        fn: (...args: any[]) => any,
        ...args: A
    ): Promise<[E, R]> {
        return new Promise((resolve: (value: [E, R]) => void) => {
            fn.call(void 0, ...args, function (err: E, ...values: any[]) {
                if (arguments.length === 1 && err !== null && err !== undefined
                    && !(err instanceof Error)) {
                    // In this case, err is not an error. e.g. fs.exists.
                    resolve([null, <any>err]);
                } else if (err) {
                    resolve([err, undefined]);
                } else {
                    if (values.length > 1) {
                        resolve([null, <any>values]);
                    } else {
                        resolve([null, values[0]]);
                    }
                }
            });
        });
    };

    export function call<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
        thisArg: any,
        fn: (...args: A) => AsyncGenerator<T, TReturn, TNext>,
        ...args: A
    ): AsyncGenerator<[E, T], [E, TReturn], TNext>;
    export function call<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
        thisArg: any,
        fn: (...args: A) => Generator<T, TReturn, TNext>,
        ...args: A
    ): Generator<[E, T], [E, TReturn], TNext>;
    export function call<E = Error, R = any, A extends any[] = any[]>(
        thisArg: any,
        fn: (...args: A) => Promise<R>,
        ...args: A
    ): Promise<[E, R]>;
    export function call<E = Error, R = any, A extends any[] = any[]>(
        thisArg: any,
        fn: (...args: A) => R,
        ...args: A
    ): [E, R];
    export function call(thisArg: any, fn: Function, ...args: any[]) {
        return apply(thisArg, <any>fn, args) as any;
    }

    export function apply<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
        thisArg: any,
        fn: (...args: A) => AsyncGenerator<true, TReturn, TNext>,
        args: A
    ): AsyncGenerator<[E, T], [E, TReturn], TNext>;
    export function apply<E = Error, T = any, A extends any[] = any[], TReturn = any, TNext = unknown>(
        thisArg: any,
        fn: (...args: A) => Generator<true, TReturn, TNext>,
        args: A
    ): Generator<[E, T], [E, TReturn], TNext>;
    export function apply<E = Error, R = any, A extends any[] = any[]>(
        thisArg: any,
        fn: (...args: A) => Promise<R>,
        args: A
    ): Promise<[E, R]>;
    export function apply<E = Error, R = any, A extends any[] = any[]>(
        thisArg: any,
        fn: (...args: A) => R,
        args: A
    ): [E, R];
    export function apply(thisArg: any, fn: Function, args: any[]) {
        try {
            let res = fn.apply(thisArg, args);

            // Implementation details should be ordered from complex to simple.

            if (isAsyncGenerator(res)) {
                return (async function* () {
                    let input: any;
                    let result: any;

                    // Use `while` loop instead of `for...of...` in order to
                    // retrieve the return value of a generator function.
                    while (true) {
                        try {
                            let {
                                done,
                                value
                            } = await (<AsyncIterableIterator<any>>res).next(input);

                            if (done) {
                                result = value;
                                break;
                            } else {
                                // Receive any potential input value that passed
                                // to the outer `next()` call, and pass them to
                                // `res.next()` in the next call.
                                input = yield Promise.resolve([null, value]);
                            }
                        } catch (err) {
                            // If any error occurs, yield that error as resolved
                            // and break the loop immediately, indicating the
                            // process is forced broken.
                            yield Promise.resolve([err, undefined]);
                            break;
                        }
                    }

                    return Promise.resolve([null, result]);
                })() as AsyncIterableIterator<any>;
            } else if (isGenerator(res)) {
                return (function* () {
                    let input: any;
                    let result: any;

                    while (true) {
                        try {
                            let {
                                done,
                                value
                            } = (<IterableIterator<any>>res).next(input);

                            if (done) {
                                result = value;
                                break;
                            } else {
                                input = yield [null, value];
                            }
                        } catch (err) {
                            yield [err, undefined];
                            break;
                        }
                    }

                    return [null, result];
                })() as IterableIterator<any>;
            } else if (typeof res?.then === "function") {
                res = res.then((value: any) => [null, value]);

                // There is no guarantee that a promise-like object's `then()`
                // method will always return a promise, to avoid any trouble, we
                // need to do one more check.
                if (typeof res?.catch === "function") {
                    return res.catch((err: any) => [err, undefined]);
                } else {
                    return res;
                }
            } else {
                return [null, res];
            }
        } catch (err) {
            return [err, undefined];
        }
    }
}