import { useCallback, useEffect, useState, useRef, React } from "react";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Card,
  Accordion,
  Button,
} from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup, EditorView } from "@uiw/react-codemirror";
import {
  globalCompletion,
  localCompletionSource,
  pyodide,
  pythonLanguage,
} from "@codemirror/lang-python";
import { LanguageSupport } from "@codemirror/language";
import * as themes from "@uiw/codemirror-themes-all";
import { useAccordionButton } from 'react-bootstrap/AccordionButton';


import "./App.css";
import fakeresults from "./fakeresults.json";





const UnitTestResultsList = ({ results }) => {
  return (
    <Accordion>
      {results.map((test, index) => (
        <div className={test.success? 'accordion-success':'accordion-fail'}>
        <Accordion.Item eventKey={index} style={{ backgroundColor: test.success ? 'lightgreen' : 'tomato', color: 'black' }}>
          <Accordion.Header >
            {test.name}
          </Accordion.Header>
          <Accordion.Body>
            <div>
              <strong>Expected Response:</strong> {test.expectedResponse}
            </div>
            <div>
              <strong>Received Response:</strong> {test.receivedResponse}
            </div>
          </Accordion.Body>
        </Accordion.Item>
        </div>
      ))}
    </Accordion>
  );
};


const TitleBar = () => {
  return (
    <Navbar expand="md" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Python Desynced Crosscompiler</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              href="https://stagegames.github.io/DesyncedJavaScriptUtils/"
              target="_blank"
            >
              Disassembler
            </Nav.Link>
            <Nav.Link
              href="https://github.com/vanweric/PythonToDesyncedCompiler/blob/main/public/Info.md"
              target="_blank"
            >
              Info
            </Nav.Link>
            <Nav.Link
              href="https://github.com/vanweric/PythonToDesyncedCompiler"
              target="_blank"
            >
              GitHub
            </Nav.Link>
            <Nav.Link
              href="https://www.youtube.com/@VDubBuilds"
              target="_blank"
            >
              YouTube
            </Nav.Link>
          </Nav>

          <Nav className="ms-auto">A</Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

const CodeBlock = () => {
  return (
    <Container fluid="xl" className="flex-grow-1 position-relative">
      <div classNamse="p-4 bg-white border rounded shadow-sm position-absolute top-0 bottom-0 start-0 end-0 overflow-auto">
        <CodeMirror
          className="cm-outer-container"
          align="left"
          height="100%"
          theme={themes.githubLight}
          extensions={[
            new LanguageSupport(pythonLanguage, [
              pythonLanguage.data.of({
                autocomplete: localCompletionSource,
              }),
              pythonLanguage.data.of({ autocomplete: globalCompletion }),
            ]),
            EditorView.lineWrapping,
          ]}
        />
      </div>
    </Container>
  );
};

function App() {
  return (
    <div className="App">
      <div className="d-flex flex-column vh-100">
        {/* Navbar */}
        <TitleBar />

        {/* Main content */}
          <Container fluid="xl" className="flex-grow-1 position-relative">
          <div className="p-4 bg-white position-absolute top-0 bottom-0 start-0 end-0 overflow-auto">
            <Row >
              <Col >
                <CodeBlock />
              </Col>
              <Col className="bg-secondary text-white p-3">
                <UnitTestResultsList results={fakeresults} />

                <h3>Right Column</h3>

                blah blah blah
              </Col>
            </Row>
          </div>
          </Container>
        {/* Footer */}

        <footer className="bg-light py-3 mt-auto">
          <Container>
            <p className="text-center mb-1">Copyright © 2024 by Eric VanWyk</p>
            <p className="text-center small text-muted">
              Freely available under the{" "}
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
              >
                MIT License
              </a>
            </p>
          </Container>
        </footer>
      </div>
    </div>
  );
}

export default App;
