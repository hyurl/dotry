import { isGenerator, isAsyncGenerator } from "check-iterable";

// Declarations should be ordered from complex to simple.

export default function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => AsyncIterableIterator<R>,
    ...args: A
): AsyncIterableIterator<[Error, R]>;

export default function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => IterableIterator<R>,
    ...args: A
): IterableIterator<[Error, R]>;

export default function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => Promise<R>,
    ...args: A
): Promise<[E, R]>;

export default function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => R,
    ...args: A
): [E, R];

export default function trydo<E, R, A extends any[]>(
    fn: (...args: A) => R,
    ...args: A
): [E, R] |
    Promise<[E, R]> |
    IterableIterator<[E, R]> |
    AsyncIterableIterator<[E, R]> {

    try {
        let res = fn.apply(void 0, args);

        // Implementation details should be ordered from complex to simple.

        if (isAsyncGenerator(res)) {
            return (async function* () {
                let input = undefined;
                let result: any;

                // Use `while` loop instead of `for...of...` in order to
                // retrieve the returning value of a generator function.
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
                            // Receive any potential input value that passed to
                            // the outer `next()` call, and pass them to
                            // `res.next()` in the next call.
                            input = yield Promise.resolve([null, value]);
                        }
                    } catch (err) {
                        // If any error occurs, yield that error as resolved and
                        // break the loop immediately, indicating the process
                        // if force broken.
                        yield Promise.resolve([err, undefined]);
                        break;
                    }
                }

                return Promise.resolve([null, result]);
            })() as AsyncIterableIterator<[E, R]>;
        } else if (isGenerator(res)) {
            return (function* () {
                let input = undefined;
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
            })() as IterableIterator<[E, R]>;
        } else if (typeof res.then === "function") {
            res = res.then((value: any) => [null, value]);

            // There is no guarantee that a promise-like object's `then()`
            // method will always return a promise, to avoid any trouble, we
            // need to do one more check.
            if (typeof res.catch === "function") {
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