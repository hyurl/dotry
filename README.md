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
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = dotry(check, "Hello, World!");
function check(str: string) {
    if (str.length === 0) {
        throw new Error("the string must not be empty");
    }
    return str;
}


// An async function
// Just for simplicity, don't forget to code in an async function on your own.
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = await dotry(checkAsync, "Hello, World!");
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

// TypeScript cannot auto infer error types, we must provided them as the first
// type argument of `dotry`, and the second argument as the return type.
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

Instead of every time invoking the function by calling `dotry()`
explicitly, it is recommended to wrap the function body instead.

```typescript
function check(str: string) {
    return dotry(() => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function checkAsync(str: string) {
    return dotry(async () => {
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
```

All these signatures will pack the result of the input function (`fn`) to an
two-element array which the first element is the potential error and the second
element is the return value (or yield value).

It is worth mentioned that once you set the `E` argument explicitly, you should
only throw error that is of the type `E`, and only return a value that is of
type `R` or `T`. Otherwise, you should only throw type `Error` and the type of
return value will be auto-inferred.

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
    let [err, stat] = await dotry(getStat, __filename);
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