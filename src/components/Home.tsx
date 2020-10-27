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

    const update = () => {
        setTs(ts + 1);
    }

    return (
        <RowContainer>
            <h1>Wasm memory preview</h1>
            <div>
                {wasm ? <Functions instance={wasm.instance} update={update} /> : ""}
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

interface IFunctions {
    instance: Instance;
    update: () => void;
}

const Functions = (props: IFunctions) => {
    let funs = Object.keys(props.instance.exports)
        .filter(f => typeof props.instance.exports[f] == "function")
        .map(f => {
            const ref = props.instance.exports[f];
            return {name: f, len: (ref as any).length || 0, ref: ref as (...args: number[]) => any}
        });

    return (
        <div>
            <p>Functions:</p>
            <ul>
                {funs.map(f => <Function fun={f} update={props.update} />)}
            </ul>
        </div>
    );
}

interface IFunction {
    fun: {
        name: string;
        len: number;
        ref: (...args: number[]) => any
    },
    update: () => void;
}

const Function = (props: IFunction) => {
    const [args, setArgs] = useState<string[]>([])
    const argsFields = [];
    if (args.length != props.fun.len) {
        const newArgs = [];
        for (let i = 0; i < props.fun.len; i++) {
            newArgs.push("0");
        }
        setArgs(newArgs);
    }
    for (let i = 0; i < args.length; i++) {
        argsFields.push(
            <InputArg value={args[i]} onChange={e => {
                args[i] = e.target.value;
                setArgs(args);
            }}
            />);
        if (i < args.length - 1) {
            argsFields.push(", ");
        }
    }

    return <li key={props.fun.name}>
        <span onClick={() => {console.log(...args); props.fun.ref(...args.map(arg => parseInt(arg))); props.update();}}>{props.fun.name}</span>({argsFields})
    </li >
}

const InputArg = styled.input`
    outline: none;
    border: none;
    background-color: transparent;
    width: 6em;
    border-bottom: solid 1px;
`;

interface IMemoryView {
    mem: Uint8Array;
}

const MemoryView = (props: IMemoryView) => {
    const rows = [];
    for (let i = 0; i < 50; i++) {
        rows.push(<MemoryRow memRow={props.mem} start={i * 16} stop={(i + 1) * 16} />)
    }
    return <div>
        {rows}
    </div>
}

interface IMemoryRow {
    memRow: Uint8Array;
    start: number;
    stop: number;
}

const MemoryRow = (props: IMemoryRow) => {
    const row = [];
    const decoder = new TextDecoder();
    const mem = props.memRow.subarray(props.start, props.stop);
    const text = mem.map(byte => byte <= 126 ? (byte >= 32 ? byte : 46) : 46);
    for (let i = 0; i < mem.length; i++) {
        row.push(<MemBox>{toHex2(mem[i])}</MemBox>);
        if (i%2 == 1) {
            row.push('\xa0');
        }
    }
    console.log(mem);

    return <MemRow><MemAddr>0x{toHex8(props.start)}:</MemAddr>{row}<div>{decoder.decode(text)}</div></MemRow>
}

/// Convert to hex with 2 digit
const toHex2 = (n: number) => {
    return (n + 0x100).toString(16).substr(-2)
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
`;

export default Home;
