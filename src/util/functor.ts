export class Functor {
    private value;

    constructor(value:any) {
        this.value = value;
    }

    static of(value:any) {
        return new Functor(value);
    }

    map(f:Function) {
        return Functor.of(f(this.value));
    }

    id(){
        return this.value;
    }

    
}
