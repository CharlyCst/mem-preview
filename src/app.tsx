import {FunctionalComponent, h} from "preact";
import styled from "styled-components";

import Home from "./components/Home";

const App: FunctionalComponent = () => {
    return (
        <Container id="app">
            <Home />
        </Container>
    );
};

const Container = styled.div`
`;

export default App;
