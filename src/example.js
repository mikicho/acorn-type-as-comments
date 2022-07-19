export function func(a = 5, a1, b: InvalidType = 5, b1: WOW, c: number = 2) {
    console.log(1);
}

export function func1(a: Pick<A, 'a'> = 6, b: string) {
    console.log(1);
}

export function func3(a: Pick<A, 'a'>, b) {
    console.log(1);
}

export function func2(a: Pick<A, 'a'> = 6, b: string[]) {
    console.log(1);
}

// type A = {
//   a: string,
//   b: walla
// }