# dotry

**Typed error-first try-catch convention of functions.**

Unlike other packages, **dotry** supports all JavaScript functions, which are
`Function`, `AsyncFunction`, `GeneratorFunction` and `AsyncGeneratorFunction`,
regardless of transpiling to `es5`, `es2015`, `es2016` or other versions.

And since it's well typed in TypeScript, it is easy to just pass any function
to **dotry**, and TypeScript will automatically infer return types of the result.

Also, **dotry** only packs the potential error and the return value into the
form of `[err, res]`, it **DOES NOT** change the outlook of the original
function.

## Install

```sh
npm i dotry
```

## Example

```typescript
import dotry from "dotry";

// A regular function
// TypeScript cannot auto infer error types, we must provided them as the first
// type argument of `dotry`, and the second argument as the return type.
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = dotry<Error, string>(check, "Hello, World!");
function check(str: string) {
    if (str.length === 0) {
        throw new Error("the string must not be empty");
    }
    return str;
}


// An async function
// Just for simplicity, don't forget to code in an async function on your own.
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = await dotry<Error, string>(checkAsync, "Hello, World!");
async function checkAsync(str: string) {
    if (str.length === 0) {
        throw new Error("the string must not be empty");
    }
    return str;
}

// A generator function
function* iterate(data: number[]) {
    for (let num of data) {
        if (num > 9) {
            throw new RangeError(`number ${num} is out of range`);
        } else {
            yield num;
        }
    }
}

// `err` will be of type `RangeError`, and `value` will be of type `number`.
for (let [err, value] of dotry<RangeError, number>(iterate, 1, 2, 3, 4)) {
    // ...
}

// A async generator function
async function* iterateAsync(data: number[]) {
    for (let num of data) {
        if (num > 9) {
            throw new RangeError(`number ${num} is out of range`);
        } else {
            yield num;
        }
    }
}

// Just for simplicity, don't forget to code in an async function on your own.
// `err` will be of type `RangeError`, and `value` will be of type `number`.
let iterator = dotry<RangeError, number>(iterate, 1, 2, 3, 4);
for await (let [err, value] of iterator) {
    // ...
}
```

## More Well-formed

Instead of every time invoking the function by calling `dotry<Error, string>()`
explicitly, it is recommended to wrap the function body instead.

```typescript
function check(str: string) {
    return dotry<Error, string>(() => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function checkAsync(str: string) {
    return dotry<Error, string>(async () => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function iterate(data: number[]) {
    return dotry<RangeError, number>(function* () {
        for (let num of data) {
            if (num > 9) {
                throw new RangeError(`number ${num} is out of range`);
            } else {
                yield num;
            }
        }
    });
}

function iterateAsync(data: number[]) {
    return dotry<RangeError, number>(async function* () {
        for (let num of data) {
            if (num > 9) {
                throw new RangeError(`number ${num} is out of range`);
            } else {
                yield num;
            }
        }
    });
}
```

## API

```typescript
function dotry<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => AsyncIterableIterator<R>,
    ...args: A
): AsyncIterableIterator<[Error, R]>;

function dotry<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => IterableIterator<R>,
    ...args: A
): IterableIterator<[Error, R]>;

function dotry<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => Promise<R>,
    ...args: A
): Promise<[E, R]>;

function dotry<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => R,
    ...args: A
): [E, R];
```

All these signatures will pack the result of the input function (`fn`) to an
two-element array which the first element is the potential error and the second
element is the return value (or yield value).

## Dealing With Traditional Callback Style Functions

There are two ways to deal with traditional callback style functions, use
`util.promisify` to wrap the function, or use `dotry.promisify` to call the
function and pack the results.

```typescript
import * as fs from "fs";
import * as util from "util";
import dotry from "dotry";

// These two examples are equivalent 
(async () => {
    const getStat = util.promisify(fs.stat);
    let [err, stat] = await dotry<Error, fs.Stats, [string]>(getStat, __filename);
    // ...
})();

(async () => {
    let [
        err,
        stat
    ] = await dotry.promisify<Error, fs.Stats, [string]>(fs.stat, __filename);
    // ...
})();
```