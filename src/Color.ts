
const TWO_THIRDS = 2 / 3;

function hue2rgb(p: number, q: number, t: number) {

    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < TWO_THIRDS) return p + (q - p) * 6 * (TWO_THIRDS - t);
    return p;

};


/**
 * Represents a color with floats
 */
export class Color {


    private _cache: Float32Array = new Float32Array([0,0,0,1]);


	/**
	 * Creates a new color object
	 * @param color
	 */
    constructor(...color: number[]) {

        if (arguments.length === 3) {

            return this.setRGB(color[0], color[1], color[2]);

        }

        if (arguments.length === 4) {

            return this.setRGBA(color[0], color[1], color[2], color[3]);

        }
    }

    get r() {
        return this._cache[0];
    }

    set r(v: number) {
        this._cache[0] = v;
    } 

    get g() {
        return this._cache[1];
    }

    set g(v: number) {
        this._cache[1] = v;
    } 


    get b() {
        return this._cache[2];
    }

    set b(v: number) {
        this._cache[2] = v;
    } 

    get a() {
        return this._cache[3];
    }

    set a(v: number) {
        this._cache[3] = v;
    } 


	/**
	 * Generic set method
	 * @param value
	 */
    set(value: any) {

        if (value instanceof Color) {

            this.copy(value);

        } else if (typeof value === 'number') {

            this.setHex(value);

        } else if (typeof value === 'string') {

            this.fromStyle(value);

        }

        return this;

    }

	/**
	 * Sets the color from a hex number
	 * @param hex
	 */
    setHex(hex: number) {

        hex = Math.floor(hex);

        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;

        return this;

    }

	/**
	 * Set alpha value
	 * @param a
	 */
    setAlpha(a: number) {
        this.a = a;
        return this;
    }

	/**
	 * Set RGB values
	 * @param r
	 * @param g
	 * @param b
	 */
    setRGB(r: number, g: number, b: number) {

        this.r = r;
        this.g = g;
        this.b = b;

        return this;

    }

	/**
	 * Set RGBA values
	 * @param r
	 * @param g
	 * @param b
	 * @param a
	 */
    setRGBA(r: number, g: number, b: number, a: number) {

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
        return this;

    }


	/**
	 * Set values as HSL
	 * @param h
	 * @param s
	 * @param l
	 */
    setHSL(h: number, s: number, l: number) {

        // h,s,l ranges are in 0.0 - 1.0

        if (s === 0) {

            this.r = this.g = this.b = l;

        } else {

            var p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            var q = (2 * l) - p;

            this.r = hue2rgb(q, p, h + 1 / 3);
            this.g = hue2rgb(q, p, h);
            this.b = hue2rgb(q, p, h - 1 / 3);

        }

        return this;

    }

	/**
	 * Set rgb(a) values from a CSS style string
	 * @param style
	 */
    fromStyle(style: string) {

        // rgb(255,0,0)

        if (/^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.test(style)) {

            var color = /^rgb\((\d+), ?(\d+), ?(\d+)\)$/i.exec(style);

            this.r = Math.min(255, parseInt(color[1], 10)) / 255;
            this.g = Math.min(255, parseInt(color[2], 10)) / 255;
            this.b = Math.min(255, parseInt(color[3], 10)) / 255;

            return this;

        }

        // rgb(100%,0%,0%)

        if (/^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.test(style)) {

            var color = /^rgb\((\d+)\%, ?(\d+)\%, ?(\d+)\%\)$/i.exec(style);

            this.r = Math.min(100, parseInt(color[1], 10)) / 100;
            this.g = Math.min(100, parseInt(color[2], 10)) / 100;
            this.b = Math.min(100, parseInt(color[3], 10)) / 100;

            return this;

        }

        // #ff0000

        if (/^\#([0-9a-f]{6})$/i.test(style)) {

            var color = /^\#([0-9a-f]{6})$/i.exec(style);

            this.setHex(parseInt(color[1], 16));

            return this;

        }

        // #f00

        if (/^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.test(style)) {

            var color = /^\#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(style);

            this.setHex(parseInt(color[1] + color[1] + color[2] + color[2] + color[3] + color[3], 16));

            return this;

        }



    }

	/**
	 * Copy values from another color object
	 * @param color
	 */
    copy(color: Color) {

        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        this.a = color.a;

        return this;

    }

	/**
	 * Copy gamma space color to linear color
	 * @param color
	 */
    copyGammaToLinear(color: Color) {

        this.r = color.r * color.r;
        this.g = color.g * color.g;
        this.b = color.b * color.b;

        return this;

    }

	/**
	 * Copy linear space to gamma space
	 * @param color
	 */
    copyLinearToGamma(color: Color) {

        this.r = Math.sqrt(color.r);
        this.g = Math.sqrt(color.g);
        this.b = Math.sqrt(color.b);

        return this;

    }

	/**
	 * Convert this color from gamma-space to linear-space
	 */
    convertGammaToLinear() {

        var r = this.r, g = this.g, b = this.b;

        this.r = r * r;
        this.g = g * g;
        this.b = b * b;

        return this;

    }

	/**
	 * Convert this color from linear-space to gamma space
	 */
    convertLinearToGamma() {

        this.r = Math.sqrt(this.r);
        this.g = Math.sqrt(this.g);
        this.b = Math.sqrt(this.b);

        return this;

    }

	/**
	 * Get an hex number from this color
	 */
    getHex() {

        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0;

    }

	/**
	 * Get an hex string
	 */
    getHexString() {

        return ('000000' + this.getHex().toString(16)).slice(- 6);

    }

	/**
	 * Compute HSL values and return it as an object
	 * @param target
	 */
    getHSL(target?: any) {

        // h,s,l ranges are in 0.0 - 1.0

        var hsl = target || { h: 0, s: 0, l: 0 };

        var r = this.r,
            g = this.g,
            b = this.b;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);

        var hue, saturation;
        var lightness = (min + max) / 2.0;

        if (min === max) {

            hue = 0;
            saturation = 0;

        } else {

            var delta = max - min;

            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

            switch (max) {

                case r: hue = (g - b) / delta + (g < b ? 6 : 0); break;
                case g: hue = (b - r) / delta + 2; break;
                case b: hue = (r - g) / delta + 4; break;

            }

            hue /= 6;

        }

        hsl.h = hue;
        hsl.s = saturation;
        hsl.l = lightness;

        return hsl;

    }

	/**
	 * Return a CSS color string
	 */
    toString() {

        return 'rgba(' + ((this.r * 255) | 0) + ',' + ((this.g * 255) | 0) + ',' + ((this.b * 255) | 0) + ',' + this.a + ')';

    }

	/**
	 * Offset the color by HSL values
	 * @param h
	 * @param s
	 * @param l
	 */
    offsetHSL(h: number, s: number, l: number) {

        var hsl = this.getHSL();

        hsl.h += h; hsl.s += s; hsl.l += l;

        this.setHSL(hsl.h, hsl.s, hsl.l);

        return this;

    }

	/**
	 * Add another color's RGB to these RGB values
	 * @param color
	 */
    add(color: Color) {

        this.r += color.r;
        this.g += color.g;
        this.b += color.b;

        return this;

    }

	/**
	 * Add 2 colors together and set the result in this one
	 * @param color1
	 * @param color2
	 */
    addColors(color1: Color, color2: Color) {

        this.r = color1.r + color2.r;
        this.g = color1.g + color2.g;
        this.b = color1.b + color2.b;

        return this;

    }

	/**
	 * Add a scalar value to the RGB channel
	 * @param s
	 */
    addScalar(s: number) {

        this.r += s;
        this.g += s;
        this.b += s;

        return this;

    }

	/**
	 * Multiply RGB by another color's RGB
	 * @param color
	 */
    multiply(color: Color) {

        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;

    }

	/**
	 * Multiply RGB chanels by a scalar value
	 * @param s
	 */
    multiplyScalar(s: number) {

        this.r *= s;
        this.g *= s;
        this.b *= s;

        return this;

    }

	/**
	 * Interpolate to another color
	 * @param color
	 * @param alpha
	 */
    lerp(color: Color, alpha: number) {

		this.r = (1 - alpha) * this.r + alpha * color.r;
		this.g = (1 - alpha) * this.g + alpha * color.g;
		this.b = (1 - alpha) * this.b + alpha * color.b;
		this.a = (1 - alpha) * this.a + alpha * color.a;

        return this;

    }

	/**
	 * Test fro equality
	 * @param c
	 */
    equals(c: Color) {

        return (c.r === this.r) && (c.g === this.g) && (c.b === this.b);

    }

	/**
	 * Get values from an array
	 * @param array
	 */
    fromArray(array: number[]) {

        this.r = array[0];
        this.g = array[1];
        this.b = array[2];
        this.a = array[3] !== undefined ? array[3] : this.a;

        return this;

    }

	/**
	 * Copy rgb(a) values to a target array
	 * @param array
	 * @param offset
	 * @param copyAlpha
	 */
    toArray(array: any, offset?: number, copyAlpha?: boolean) {

        if (array === undefined)
            array = [];
        if (offset === undefined)
            offset = 0;

        array[offset] = this.r;
        array[offset + 1] = this.g;
        array[offset + 2] = this.b;
        if (/*copyAlpha ===*/ true) array[offset + 3] = this.a;
        return array;

    }

	/**
	 * This color as a Float32Array
	 */
    toFloatArray() {

        return this._cache;
    }

	/**
	 * Creates a copy of this color object
	 */
    clone() {
        return new Color(this.r, this.g, this.b, this.a);
    }


	/**
	 * Compute a linear interpolation
	 * @param v0
	 * @param v1
	 * @param t
	 * @param out
	 */
    static Lerp(v0: Color, v1: Color, t: number, out: Color) {

        let x = (1 - t) * v0.r + t * v1.r;
        let y = (1 - t) * v0.g + t * v1.g;
        let z = (1 - t) * v0.b + t * v1.b;
        let w = (1 - t) * v0.a + t * v1.a;

        out.setRGBA(x, y, z, w);


    }

};