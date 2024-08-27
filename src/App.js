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
  Tabs,
  Tab,
  NavDropdown,
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
import { useAccordionButton } from "react-bootstrap/AccordionButton";

import "./App.css";
import fakeresults from "./fakeresults.json";
import exercises from "./exercises.json";

import usePyodide from "./usePyodide";

function App() {
  const [editorValue, setEditorValue] = useState("");
  const [exerciseConfig, setExerciseConfig] = useState([]);
  const [exerciseResults, setExerciseResults] = useState([]);
  const [testRunnerScript, setTestRunnerScript] = useState("");
  const [busy, setBusy] = useState(false);

  const UnitTestResultsList = ({ results }) => {
    return (
      <Accordion>
        {results.map((test, index) => (
          <div
            className={test.success ? "accordion-success" : "accordion-fail"}
            key={index}
          >
            <Accordion.Item
              eventKey={String(index)}
              style={{
                backgroundColor: test.success ? "lightgreen" : "tomato",
                color: "black",
              }}
            >
              <Accordion.Header>{test.name}</Accordion.Header>
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
          <Navbar.Brand href="#home">AST Exercises</Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
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

            <Nav className="ms-auto">
              <NavDropdown title="Exercises" id="basic-nav-dropdown" disabled={busy}>
                {exercises.map((item, ix) => (
                  <NavDropdown.Item onClick={() => loadExercise(item)} key={ix}>
                    {item}
                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  };

  const loadExercise = async (name) => {

      fetch(`./exercises/${name}.json`)
      .then((r) => r.json())
      .then((blob) => {
        console.log(blob);
        setEditorValue(blob.preloadText.join("\n"));
      })
      fetch(`testrunner.py`)
      .then((r)=> r.text())
      .then((r)=> setTestRunnerScript(r));
  
    runTests();
  };

  const runTests = async () => {
    console.log(testRunnerScript);
    const firstResult = pyodide.runPython(testRunnerScript);
    console.log(firstResult);
    const locals = pyodide.toPy({func: {editorValue}, config: {exerciseConfig}});
    const result = pyodide.runPython("runtests(func, config)", {locals} );
    
    console.log(result);

    console.log(result.toJs());

    setExerciseConfig([]);
  };

  const CodeBlock = () => {
    return (
      <CodeMirror
        className="cm-outer-container"
        value={editorValue}
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
    );
  };

  const { pyodide, loading } = usePyodide();

  return (
    <div className="App">
      <div className="d-flex flex-column vh-100">
        {/* Navbar */}
        <TitleBar />

        {/* Main content */}
        <Container
          fluid="xl"
          className="flex-grow-1 position-relative bg-light"
          style={{ height: "100vh" }}
        >
          <Row className="h-100">
            <Col
              style={{
                position: "absolute",
                height: "100%",
                width: "64%",
                overflowY: "auto",
              }}
            >
              <br></br>
              <CodeBlock />
            </Col>
            <Col
              className="bg-secondary"
              style={{
                position: "absolute",
                height: "100%",
                width: "32%",
                right: 0,
              }}
            >
              <Tabs
                defaultActiveKey="description"
                id="side-column"
                className="mb-3"
              >
                <Tab eventKey="description" title="Description">
                  <h3>Right Column</h3>
                  blah blah blah
                </Tab>
                <Tab eventKey="tests" title="Tests">
                  <UnitTestResultsList results={exerciseResults} />
                </Tab>
              </Tabs>
            </Col>
          </Row>
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
