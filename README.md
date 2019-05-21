# TryDo

**Typed error-first try-catch convention of functions.**

Unlike other packages, **trydo** support all JavaScript functions, which are
`Function`, `AsyncFunction`, `GeneratorFunction` and `AsyncGeneratorFunction`,
regardless of transpiling to `es5`, `es2015`, `es2016` or even higher versions.

And since it's well typed in TypeScript, it is easy to just pass any function
to **trydo**, and TypeScript will automatically infer returning types of the
result.

## Install

```sh
npm i trydo
```

## Example

```typescript
import trydo from "trydo";

// A regular function
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = trydo(check, void 0, "Hello, World!");
function check(str: string) {
    if (str.length === 0) {
        throw new Error("the string must not be empty");
    }
    return str;
}


// An async function
// `err` will be of type `Error` and `res` will be of type `string`
let [err, res] = await trydo(checkAsync, void 0, "Hello, World!");
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
// type argument of `trydo`, and the second argument as the returning type.
// In this case, `err` will be of type `RangeError`, and `value` will be of type
// `number`.
for (let [err, value] of trydo<RangeError, number>(iterate, void 0, 1, 2, 3, 4)) {
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

let iterator = trydo<RangeError, number>(iterate, void 0, 1, 2, 3, 4);
for await (let [err, value] of iterator) {
    // ...
}
```

## More Well-formed

Instead of every time invoking the function by calling `trydo()` explicitly, it
is recommended to wrap the function body instead.

```typescript
function check(str: string) {
    return trydo(() => {
        if (str.length === 0) {
            throw new Error("the string must not be empty");
        }
        return str;
    });
}

function checkAsync(str: string) {
    return trydo(async () => {
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
function trydo<E extends Error, R, A extends any[]= any[]>(
    fn: (...args: A) => AsyncIterableIterator<R>,
    thisArg?: any,
    ...args: A
): AsyncIterableIterator<[Error, R]>;

function trydo<E extends Error, R, A extends any[]= any[]>(
    fn: (...args: A) => IterableIterator<R>,
    thisArg?: any,
    ...args: A
): IterableIterator<[Error, R]>;

function trydo<E extends Error, R, A extends any[]= any[]>(
    fn: (...args: A) => Promise<R>,
    thisArg?: any,
    ...args: A
): Promise<[E, R]>;

function trydo<E extends Error, R, A extends any[]= any[]>(
    fn: (...args: A) => R,
    thisArg?: any,
    ...args: A
): [E, R];
```

All these signatures will pack the result of the input function (`fn`) to an 
two-element array which the first element is the potential error and the second
element is the returning value (or iterating value).

Also, **trydo** allows you passing `thisArg` and arbitrary number of arguments
into the main function, which is very useful most of the times, especially in a
class method.

```typescript
class Test {
    doSomething(action: string, data: string[]) {
        return trydo(function (this: Test) {
            // ...
        }, this);
    }

    // is equalvelent to
    doSomething2(action: string, data: string[]) {
        return trydo(() => {
            // ...
        });
    }

    // However, when it comes to generators, you have to use keyword `function`
    // and pass the `thisArg`.
    doSomething3(action: string, data: string[]) {
        return trydo(function* (this: Test) {
            // ...
        }, this);
    }

    doSomething4(action: string, data: string[]) {
        return trydo(async function* (this: Test) {
            // ...
        }, this);
    }
}

// Then all these methods are packed with the form of [err, res], you can call
// them directly.

let test = new Test();
let [err, res] = test.doSomething();
```