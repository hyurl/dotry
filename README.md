# TryDo

**Typed error-first try-catch convention of functions.**

Unlike other packages, **trydo** support all JavaScript functions, which are
`Function`, `AsyncFunction`, `GeneratorFunction` and `AsyncGeneratorFunction`,
regardless of transpiling to `es5`, `es2015`, `es2016` or even higher versions.

And since it's well typed in TypeScript, it is easy to just pass any function
to **trydo**, and TypeScript will automatically infer returning types of the
result.

Also, **trydo** only packs the potential error and the returning value into the
form of `[err, res]`, it **DOES NOT** change the outlook of the original
function.

## Install

```sh
npm i trydo
```

## Example

```typescript
import trydo from "trydo";

// A regular function
// TypeScript cannot auto infer error types, we must provided them as the first
// type argument of `trydo`, and the second argument as the returning type.
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = trydo<Error, string>(check, "Hello, World!");
function check(str: string) {
    if (str.length === 0) {
        throw new Error("the string must not be empty");
    }
    return str;
}


// An async function
// Just for simplicity, don't forget to code in an async function on your own.
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = await trydo<Error, string>(checkAsync, "Hello, World!");
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
for (let [err, value] of trydo<RangeError, number>(iterate, 1, 2, 3, 4)) {
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
let iterator = trydo<RangeError, number>(iterate, 1, 2, 3, 4);
for await (let [err, value] of iterator) {
    // ...
}
```

## More Well-formed

Instead of every time invoking the function by calling `trydo<Error, string>()`
explicitly, it is recommended to wrap the function body instead.

```typescript
function check(str: string) {
    return trydo<Error, string>(() => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function checkAsync(str: string) {
    return trydo<Error, string>(async () => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function iterate(data: number[]) {
    return trydo<RangeError, number>(function* () {
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
    return trydo<RangeError, number>(async function* () {
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
function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => AsyncIterableIterator<R>,
    ...args: A
): AsyncIterableIterator<[Error, R]>;

function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => IterableIterator<R>,
    ...args: A
): IterableIterator<[Error, R]>;

function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => Promise<R>,
    ...args: A
): Promise<[E, R]>;

function trydo<E = any, R = any, A extends any[]= any[]>(
    fn: (...args: A) => R,
    ...args: A
): [E, R];
```

All these signatures will pack the result of the input function (`fn`) to an 
two-element array which the first element is the potential error and the second
element is the returning value (or iterating value).