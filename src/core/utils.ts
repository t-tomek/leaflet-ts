export let lastId = 0;
export function stamp(object: any) {
    object.leafletId = object.leafletId || ++lastId;
    
    return object.leafletId;
}

export function wrapNum(x: number, [min, max]: number[], includeMax = false) {
    const difference = max - min;

    return (x === max && includeMax) ?
        x :
        ((x - min) % difference + difference) % difference + min
    ;
};

export function template(string: string, data: any) {
    return string.replace(/\{ *([\w_-]+) *\}/g, function (string, key) {
        const value = data[key];

        if (value === undefined) {
            throw new Error("No value provided for variable " + string);
        }

        return value;
    });
};

export function *range(start: number = 0, end: number,  step: number = 1) {
    let  iterationCount = 0;
    for (let i = start; i <= end; i += step) {
        iterationCount++;
        yield i;
    }

    return iterationCount;
};
