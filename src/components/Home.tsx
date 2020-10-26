import {FunctionalComponent, h} from "preact";
import {useEffect, useState} from "preact/hooks";
import styled from "styled-components";

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
    let [ts, setTs] = useState(0);

    useEffect(() => {
        WebAssembly.instantiateStreaming(fetch("wasm/main.wasm"))
            .then(m => setWasm({
                mod: m.module,
                instance: m.instance,
                mem: m.instance.exports.memory as Memory,
            }))
            .catch(e => console.log("Failed instatiation:", e))
    }, []);

    const call = (f: () => any) => {
        console.log(f());
        setTs(ts + 1);
    }

    return (
        <RowContainer>
            <h1>Wasm memory preview</h1>
            <div>
                {wasm ? <Function instance={wasm.instance} call={call} /> : ""}
                {wasm ? <MemoryView mem={new Uint8Array(wasm.mem.buffer)} /> : ""}
            </div>
        </RowContainer>
    );
};

const RowContainer = styled.div`
display: flex;
flex-direction: column;
align-items: center;
`

interface IFunction {
    instance: Instance;
    call: (f: () => any) => void;
}

const Function = (props: IFunction) => {
    let funs = Object.keys(props.instance.exports)
        .filter(f => typeof props.instance.exports[f] == "function")
        .map(f => ({name: f, ref: props.instance.exports[f] as () => any}));
    return (
        <div>
            <p>Functions:</p>
            <ul>
                {funs.map(f => <li key={f.name} onClick={() => props.call(f.ref)}>{f.name}</li>)}
            </ul>
        </div>
    );
}

interface IMemoryView {
    mem: Uint8Array;
}

const MemoryView = (props: IMemoryView) => {
    const rows = [];
    for (let i = 0; i < 50; i++) {
        rows.push(<MemoryRow memRow={props.mem.subarray(i * 8, (i + 1) * 8)} addr={i * 16} />)
    }
    return <div>
        {rows}
    </div>
}

interface IMemoryRow {
    memRow: Uint8Array;
    addr: number;
}

const MemoryRow = (props: IMemoryRow) => {
    const row = [];
    const decoder = new TextDecoder();
    const text = props.memRow.map(byte => byte <= 126 ? (byte >= 32 ? byte : 46) : 46);
    const view = new Uint16Array(props.memRow);
    for (let i = 0; i < props.memRow.length; i++) {
        row.push(<MemBox>{toHex4(view[i])}</MemBox>);
    }

    return <MemRow><MemAddr>0x{toHex8(props.addr)}:</MemAddr>{row}<div>{decoder.decode(text)}</div></MemRow>
}

/// Convert to hex with 4 digit
const toHex4 = (n: number) => {
    return (n + 0x10000).toString(16).substr(-4)
}

/// Convert to hex with 8 digit
const toHex8 = (n: number) => {
    return (n + 0x100000000).toString(16).substr(-8)
}

const MemRow = styled.div`
display: flex;
`;

const MemAddr = styled.div`
text-align: center;
width: 7rem;
`

const MemBox = styled.div`
text-align: center;
width: 3rem;
`;

export default Home;
