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

export function template(templateString: string, data: any) {
    return templateString.replace(/\{ *([\w_-]+) *\}/g, (variableName, key) => {
        const value = data[key];

        if (value === undefined) {
            throw new Error("No value provided for variable " + variableName);
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
