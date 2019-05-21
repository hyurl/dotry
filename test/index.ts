import trydo from "../src";
import * as assert from "assert";
import * as fs from "fs";

const EmptyStringError = new Error("the string must not be empty");

describe("trydo", () => {
    it("should invoke an regular function as expected", () => {
        function check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }
            return str;
        }

        let res = trydo(check, "Hello, World!");
        let _res = trydo<Error, string, [string]>(check, "");
        let [err, str] = res;
        let [_err, _str] = _res;

        assert.strictEqual(res.length, 2);
        assert.strictEqual(_res.length, 2);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, EmptyStringError);
        assert.strictEqual(_str, undefined);
    });

    it("should wrap an regular function as expected", () => {
        function check(str: string) {
            return trydo<Error, string>(() => {
                if (str.length === 0) {
                    throw EmptyStringError;
                }
                return str;
            });
        }

        let res = check("Hello, World!");
        let _res = check("");
        let [err, str] = res;
        let [_err, _str] = _res;

        assert.strictEqual(res.length, 2);
        assert.strictEqual(_res.length, 2);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, EmptyStringError);
        assert.strictEqual(_str, undefined);
    });

    it("should invoke an async function as expected", async () => {
        async function check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }
            return str;
        }

        let res = trydo<Error, string, [string]>(check, "Hello, World!");
        let _res = trydo<Error, string, [string]>(check, "");
        let [err, str] = await res;
        let [_err, _str] = await _res;

        assert(res instanceof Promise);
        assert(_res instanceof Promise);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, EmptyStringError);
        assert.strictEqual(_str, undefined);
    });

    it("should wrap an async function as expected", async () => {
        function check(str: string) {
            return trydo<Error, string>(async () => {
                if (str.length === 0) {
                    throw EmptyStringError;
                }
                return str;
            });
        }

        let res = check("Hello, World!");
        let _res = check("");
        let [err, str] = await res;
        let [_err, _str] = await _res;

        assert(res instanceof Promise);
        assert(_res instanceof Promise);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, EmptyStringError);
        assert.strictEqual(_str, undefined);
    });

    it("should invoke an generator function as expected", () => {
        function* check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }

            for (let x of str) {
                yield x;
            }

            return "OK";
        }

        let res = trydo<Error, string, [string]>(check, "Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = res.next();

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!OK");

        let _res = trydo<Error, string, [string]>(check, "");
        let _str = "";
        let _errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = _res.next();

            if (done) {
                x !== undefined && (_str += x);
                break;
            } else if (err) {
                _errors.push(err);
            } else {
                _str += x;
            }
        }

        assert.deepStrictEqual(_errors, [EmptyStringError]);
        assert.strictEqual(_str, "");
    });

    it("should wrap an generator function as expected", () => {
        function check(str: string) {
            return trydo<Error, string>(function* () {
                if (str.length === 0) {
                    throw EmptyStringError;
                }

                for (let x of str) {
                    yield x;
                }

                return "OK";
            });
        }

        let res = check("Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = res.next();

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!OK");
    });

    it("should pass value into the generator function as expected", () => {
        function check(str: string) {
            return trydo<Error, string>(function* () {
                if (str.length === 0) {
                    throw EmptyStringError;
                }

                let count = 0;

                for (let x of str) {
                    count += yield x;
                }

                return String(count);
            });
        }

        let res = check("Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = res.next(1);

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!13");
    });

    it("should invoke an async generator function as expected", async () => {
        async function* check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }

            for (let x of str) {
                yield x;
            }

            return "OK";
        }

        let res = trydo<Error, string, [string]>(check, "Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = await res.next();

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!OK");

        let _res = trydo(check, "");
        let _str = "";
        let _errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = await _res.next();

            if (done) {
                x !== undefined && (_str += x);
                break;
            } else if (err) {
                _errors.push(err);
            } else {
                _str += x;
            }
        }

        assert.deepStrictEqual(_errors, [EmptyStringError]);
        assert.strictEqual(_str, "");
    });

    it("should wrap an async generator function as expected", async () => {
        function check(str: string) {
            return trydo<Error, string>(async function* () {
                if (str.length === 0) {
                    throw EmptyStringError;
                }

                for (let x of str) {
                    yield x;
                }

                return "OK";
            });
        }

        let res = check("Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = await res.next();

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!OK");
    });

    it("should pass value into the async generator function as expected", async () => {
        function check(str: string) {
            return trydo<Error, string>(async function* () {
                if (str.length === 0) {
                    throw EmptyStringError;
                }

                let count = 0;

                for (let x of str) {
                    count += yield x;
                }

                return String(count);
            });
        }

        let res = check("Hello, World!");
        let str = "";
        let errors: Error[] = [];

        while (true) {
            let { value: [err, x], done } = await res.next(1);

            if (done) {
                x !== undefined && (str += x);
                break;
            } else if (err) {
                errors.push(err);
            } else {
                str += x;
            }
        }

        assert.deepStrictEqual(errors, []);
        assert.strictEqual(str, "Hello, World!13");
    });
});

describe("trydo.promosify", () => {
    it("should return a promise of result as expected", async () => {
        let [
            err,
            stat
        ] = await trydo.promisify<NodeJS.ErrnoException, fs.Stats, [string]>(
            fs.stat,
            __filename
        );

        assert.strictEqual(err, null);
        assert.strictEqual(stat.isFile(), true);

        let [
            _err,
            _stat
        ] = await trydo.promisify<NodeJS.ErrnoException, fs.Stats, [string]>(
            fs.stat,
            __filename + ".map"
        );

        assert.strictEqual(_err.name, "Error");
        assert.strictEqual(_err.code, "ENOENT");
        assert.strictEqual(_stat, undefined);
    });

    it("should promisify a function without error argument as expected", async () => {
        let [err, exists] = await trydo.promisify<null, boolean, [string]>(
            fs.exists,
            __filename
        );

        assert.strictEqual(err, null);
        assert.strictEqual(exists, true);

        let [_err, _exists] = await trydo.promisify<null, boolean, [string]>(
            fs.exists,
            __filename + ".map"
        );

        assert.strictEqual(_err, null);
        assert.strictEqual(_exists, false);
    });

    it("should promisify a function with only error argument as expected", async () => {
        let [
            err,
            res
        ] = await trydo.promisify<NodeJS.ErrnoException, void, [string, number]>(
            fs.access,
            __filename,
            fs.constants.F_OK
        );

        assert.strictEqual(err, null);
        assert.strictEqual(res, undefined);

        let [
            _err,
            _res
        ] = await trydo.promisify<NodeJS.ErrnoException, void, [string, number]>(
            fs.access,
            __filename + ".map",
            fs.constants.F_OK
        );

        assert.strictEqual(_err.name, "Error");
        assert.strictEqual(_err.code, "ENOENT");
        assert.strictEqual(_res, undefined);
    });

    it("should promisify a function with array result as expected", async () => {
        function test(
            data: string[],
            callback: (err: Error, ...data: string[]) => void
        ) {
            if (!data || data.length === 0) {
                callback(new Error("data can not be empty"));
            } else {
                callback(null, ...data);
            }
        }

        let [
            err,
            data
        ] = await trydo.promisify<Error, string[], [string[]]>(test, [
            "Hello",
            "World"
        ]);

        assert.strictEqual(err, null);
        assert.deepStrictEqual(data, ["Hello", "World"]);

        let [
            _err,
            _data
        ] = await trydo.promisify<Error, string[], [string[]]>(test, []);

        assert.strictEqual(_err.name, "Error");
        assert.strictEqual(_err.message, "data can not be empty");
        assert.strictEqual(_data, undefined);
    });
});