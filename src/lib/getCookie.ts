/**
 * The following code is a modifed version of `es-cookie` taken from
 * https://github.com/theodorejb/es-cookie
 *
 * Copyright 2017 Theodore Brown
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.*
 */

const readValue = (value: string): string => {
	return value.replace(/%3B/g, ";");
};

export const parse = (cookieString: string): { [name: string]: string } => {
	const result: { [name: string]: string } = {};
	const cookies = cookieString.split("; ");

	for (const cookie of cookies) {
		const parts = cookie.split("=");
		const value = parts.slice(1).join("=");
		const name = readValue(parts[0]).replace(/%3D/g, "=");
		result[name] = readValue(value);
	}

	return result;
};

const getAll = (cookieStore: string): { [name: string]: string } =>
	parse(cookieStore);

/**
 * Returns the value of a cookie from a given cookie store.
 *
 * @param Name - Of the cookie.
 * @param cookieStore - The stringified cookie store from which to read the cookie.
 *
 * @returns The value of the cookie, if it exists.
 */
export const getCookie = (
	name: string,
	cookieStore: string,
): string | undefined => getAll(cookieStore)[name];
