export function arraysMatch(one: unknown[], two: unknown[]): boolean {
    return one.length === two.length && one.every((oneValue, index) => oneValue === two[index]);
}
