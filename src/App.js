import { useCallback, useEffect, useState, useRef, React } from "react";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Accordion,
  Button,
  Tabs,
  Tab,
  NavDropdown,
  Form,
} from "react-bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { basicSetup, EditorView } from "@uiw/react-codemirror";
import {
  globalCompletion,
  localCompletionSource,
  pythonLanguage,
} from "@codemirror/lang-python";
import { LanguageSupport } from "@codemirror/language";
import * as themes from "@uiw/codemirror-themes-all";
import ReactMarkdown from "react-markdown";

import "./App.css";
import exercises from "./exercises.json";
import intromd from "./intromd"

import usePyodide from "./usePyodide";
import Markdown from "react-markdown";

// This has been temporarily inlined, so this is currently not authorative.
// When called through <CodeBlock /> updates to the text don't work.  WHY?
const CodeBlock = ({ value, onChange }) => {
  return (
    <CodeMirror
      className="cm-outer-container"
      value={value}
      onChange={onChange}
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
                <strong>Input:</strong> {test.input}
              </div>{" "}
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

const TitleBar = ({ disable, onSelect }) => {
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
            <NavDropdown
              title="Exercises"
              id="basic-nav-dropdown"
              disabled={disable}
            >
              {exercises.map((item, ix) => (
                <NavDropdown.Item onClick={() => onSelect(item)} key={ix}>
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

const REPL = ({ runRepl }) => {
  return (
    <div>
      <Form>
        <Form.Group className="mb-3" controlId="reply.input">
          <Form.Label> Input </Form.Label>
          <Form.Control as="textarea" rows={4} />
        </Form.Group>

        <Form.Group className="mb-3" controlId="reply.output">
          <Form.Label> Output </Form.Label>
          <Form.Control as="textarea" rows={6} readOnly />
        </Form.Group>

        <Form.Group className="mb-3" controlId="reply.console">
          <Form.Label> Console Output </Form.Label>
          <Form.Control as="textarea" rows={6} readOnly />
        </Form.Group>
      </Form>

      <Button
        variant="primary"
        onClick={runRepl}
        style={{ marginRight: "5px" }}
      ></Button>
    </div>
  );
};

const NotLoaded = () => {
  return <div style={{ textAlign: 'left' }}><ReactMarkdown>{intromd}</ReactMarkdown></div>;
};

function App() {
  const { pyodide, loading } = usePyodide();
  const [editorValue, setEditorValue] = useState("");
  const [fromEditorValue, setFromEditorValue] = useState("");

  const [exerciseConfig, setExerciseConfig] = useState({});
  const [exerciseResults, setExerciseResults] = useState([]);
  const [testRunnerScript, setTestRunnerScript] = useState("");
  const [exerciseHelpText, setExerciseHelpText] = useState("");
  const [busy, setBusy] = useState(false);

  const editorChange = useCallback((val, viewUpdate) => {
    setFromEditorValue(val);
  });

  const loadExercise = async (name) => {
    console.log("Load Exercise");
    const [exerciseBlob, testRunner, exampleCode, helpText] = await Promise.all([
      (async () => {
        const response1 = await fetch(`./exercises/${name}.json`);
        return await response1.json();
      })(),
      (async () => {
        const response2 = await fetch(`testrunner.py`);
        return await response2.text();
      })(),
      (async () => {
        const response3 = await fetch(`./exercises/${name}.py`);
        return await response3.text();
      })(),
      (async () => {
        const response4 = await fetch(`./exercises/${name}.md`);
        return await response4.text();
      })(),
    ]);
    console.log("blob", exerciseBlob.length);
    // console.log("trs", testRunner);

    //setEditorValue(exerciseBlob.preloadText.join("\n"));
    //setFromEditorValue(exerciseBlob.preloadText.join("\n"));
    setEditorValue(exampleCode);
    setFromEditorValue(exampleCode);
    setExerciseConfig(exerciseBlob);
    setTestRunnerScript(testRunner);
    setExerciseHelpText(helpText);
  };

  const runTests = () => {
    if (pyodide) {
      //console.log("trs", testRunnerScript);
      pyodide.runPython(testRunnerScript);

      const locals = pyodide.toPy({
        func: fromEditorValue,
        config: exerciseConfig,
      });
      const result = JSON.parse(
        pyodide.runPython("runtests(func, config)", { locals })
      );

      console.log(result);
      console.log(result.success);

      if (result.success) {
        console.log("Results:\n", result.results);
        setExerciseResults(result.results);
      }
    }
  };

  useEffect(() => runTests(), [testRunnerScript]);

  return (
    <div className="App">
      <div className="d-flex flex-column vh-100">
        {/* Navbar */}
        <TitleBar disable={busy || loading} onSelect={loadExercise} />

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
              <CodeBlock value={editorValue} onChange={editorChange} />
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
              {Object.keys(exerciseConfig).length > 0 ? (
                <Tabs
                  defaultActiveKey="description"
                  id="side-column"
                  className="mb-3"
                >
                  <Tab eventKey="description" title="Description">
                    <ReactMarkdown>
                      {exerciseHelpText}
                    </ReactMarkdown>
                  </Tab>
                  <Tab eventKey="repl" title="Freeform Test">
                    <REPL runRepl={runTests} />
                  </Tab>

                  <Tab eventKey="tests" title="Unit Tests">
                    <Button
                      variant="primary"
                      disabled={busy}
                      onClick={runTests}
                      style={{ marginRight: "5px" }}
                    >
                      {" "}
                      RunTests{" "}
                    </Button>

                    <UnitTestResultsList results={exerciseResults} />
                  </Tab>
                </Tabs>
              ) : (
                <NotLoaded />
              )}
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
