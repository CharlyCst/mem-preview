import { FunctionalComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";

type Instance = WebAssembly.Instance;
type Module = WebAssembly.Module;
type Memory = WebAssembly.Memory;

interface Wasm {
    mod: Module;
    instance: Instance;
    mem: Memory;
}

const Home: FunctionalComponent = () => {
    let [wasm, setWasm] = useState<undefined | Wasm>(undefined);

    useEffect(() => {
        let memory = new WebAssembly.Memory({ initial: 1 });
        WebAssembly.instantiateStreaming(fetch("wasm/main.wasm"), { env: { memory: memory } })
            .then(m => setWasm({ mod: m.module, instance: m.instance, mem: memory }))
    }, []);

    return (
        <div>
            <h1>Wasm memory preview</h1>
            <div>
                {wasm ? <Function mod={wasm.mod} /> : ""}
                {wasm ? <MemoryView mem={wasm.mem} /> : ""}
            </div>
        </div>
    );
};

interface IFunction {
    mod: Module;
}

const Function = (props: IFunction) => {
    let funs = WebAssembly.Module.exports(props.mod)
        .map(e => <li key={e.name}>{e.name}</li>);

    return (
        <div>
            <p>Functions:</p>
            <ul>
                {funs}
            </ul>
        </div>
    );
}

interface IMemoryView {
    mem: Memory;
}

const MemoryView = (props: IMemoryView) => {
    let view = new Uint8Array(props.mem.buffer);
    console.log(view);

    return <div />
}

export default Home;
