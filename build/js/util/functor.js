export class Functor {
    constructor(value) {
        this.value = value;
    }
    static of(value) {
        return new Functor(value);
    }
    map(f) {
        return Functor.of(f(this.value));
    }
    id() {
        return this.value;
    }
}
