import * as assert from "assert";
import trydo from "../src";

describe("trydo", () => {
    it("should invoke an regular function as expected", () => {
        const EmptyStringError = new Error("the string must not be empty");

        function check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }
            return str;
        }

        let res = trydo(check, void 0, "Hello, World!");
        let _res = trydo(check, void 0, "");
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
        const EmptyStringError = new Error("the string must not be empty");

        async function check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }
            return str;
        }

        let res = trydo(check, void 0, "Hello, World!");
        let _res = trydo(check, void 0, "");
        let [err, str] = await res;
        let [_err, _str] = await _res;

        assert(res instanceof Promise);
        assert(_res instanceof Promise);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, EmptyStringError);
        assert.strictEqual(_str, undefined);
    });

    it("should wrap an regular function as expected", () => {
        const EmptyStringError = new Error("the string must not be empty");

        function check(str: string) {
            return trydo(() => {
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

    it("should wrap an async function as expected", async () => {
        const EmptyStringError = new Error("the string must not be empty");

        function check(str: string) {
            return trydo(async () => {
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

    it("should invoke an regular function with thisArg as expected", () => {
        const StringNotEqaulError = new Error("the string must not be empty");

        class Test {
            str = "Hello, World!";

            check(str: string) {
                if (str !== this.str) {
                    throw StringNotEqaulError;
                }
                return this.str;
            }
        }

        let test = new Test();
        let res = trydo(test.check, test, "Hello, World!");
        let _res = trydo(test.check, test, "");
        let [err, str] = res;
        let [_err, _str] = _res;

        assert.strictEqual(res.length, 2);
        assert.strictEqual(_res.length, 2);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, StringNotEqaulError);
        assert.strictEqual(_str, undefined);
    });

    it("should invoke an async function with thisArg as expected", async () => {
        const StringNotEqaulError = new Error("the string must not be empty");

        class Test {
            str = "Hello, World!";

            async check(str: string) {
                if (str !== this.str) {
                    throw StringNotEqaulError;
                }
                return this.str;
            }
        }

        let test = new Test();
        let res = trydo(test.check, test, "Hello, World!");
        let _res = trydo(test.check, test, "");
        let [err, str] = await res;
        let [_err, _str] = await _res;

        assert(res instanceof Promise);
        assert(_res instanceof Promise);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, StringNotEqaulError);
        assert.strictEqual(_str, undefined);
    });

    it("should wrap an regular function with thisArg as expected", () => {
        const StringNotEqaulError = new Error("the string must not be empty");

        class Test {
            str = "Hello, World!";

            check(str: string) {
                return trydo(function (this: Test) {
                    if (str !== this.str) {
                        throw StringNotEqaulError;
                    }
                    return this.str;
                }, this);
            }
        }

        let test = new Test();
        let res = test.check("Hello, World!");
        let _res = test.check("");
        let [err, str] = res;
        let [_err, _str] = _res;

        assert.strictEqual(res.length, 2);
        assert.strictEqual(_res.length, 2);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, StringNotEqaulError);
        assert.strictEqual(_str, undefined);
    });

    it("should wrap an async function with thisArg as expected", async () => {
        const StringNotEqaulError = new Error("the string must not be empty");

        class Test {
            str = "Hello, World!";

            check(str: string) {
                return trydo(async function (this: Test) {
                    if (str !== this.str) {
                        throw StringNotEqaulError;
                    }
                    return this.str;
                }, this);
            }
        }

        let test = new Test();
        let res = test.check("Hello, World!");
        let _res = test.check("");
        let [err, str] = await res;
        let [_err, _str] = await _res;

        assert(res instanceof Promise);
        assert(_res instanceof Promise);
        assert.strictEqual(err, null);
        assert.strictEqual(str, "Hello, World!");
        assert.strictEqual(_err, StringNotEqaulError);
        assert.strictEqual(_str, undefined);
    });

    it("should invoke an generator function as expected", () => {
        const EmptyStringError = new Error("the string must not be empty");

        function* check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }

            for (let x of str) {
                yield x;
            }

            return "OK";
        }

        let res = trydo(check, void 0, "Hello, World!");
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

        let _res = trydo(check, void 0, "");
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

    it("should invoke an async generator function as expected", async () => {
        const EmptyStringError = new Error("the string must not be empty");

        async function* check(str: string) {
            if (str.length === 0) {
                throw EmptyStringError;
            }

            for (let x of str) {
                yield x;
            }

            return "OK";
        }

        let res = trydo(check, void 0, "Hello, World!");
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

        let _res = trydo(check, void 0, "");
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
});