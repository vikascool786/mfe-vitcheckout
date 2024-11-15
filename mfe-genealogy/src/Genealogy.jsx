import { useState, useEffect } from 'react';

// Bootstrap Elements
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import Accordion from 'react-bootstrap/Accordion';

// YFiles Elements
import {
    OrgChart,
    Overview,
    Controls,
    OrgChartControlButtons,
    registerLicense
} from '@yworks/react-yfiles-orgchart';

// Default YFiles Styles
import '@yworks/react-yfiles-orgchart/dist/index.css';

// YFiles License and Validation
import yFilesLicense from './assets/license.json';
registerLicense(yFilesLicense);

// TO-DO: Create a fetch for this data
import data from './data/eugeneW.json';

// Component-scoped styles
import "./Genealogy.scss";

function TooltipComponent({ text }) {
    console.log(text);
    return (
        <div
            style={{
                backgroundColor: "tomato",
                padding: 5,
                borderRadius: 10,
                color: "white",
            }}
        >
            {text}
        </div>
    );
}

export default function Counter(props) {
    const [text, setText] = useState('');
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setText(("name" in data) ? `${data.name}, ${data.position}` :
                ("source" in data) ? `${data.source.name} → ${data.target.name}` : '');
    }, [data]);

    return (
        <div className="Genealogy">
            <div className="mfe-genealogy">
                <div className="c-app">
                    <div className="c-group">
                        {/* <div className="c-sidebar">
                            <div className="c-sidebar__input-group">
                                <Form>
                                    <Form.Label className="c-flex-form" htmlFor="ufoId">Starting Point UFO ID#</Form.Label>
                                    <div className="c-search__with-button">
                                        <Form.Control className="w-auto" type="text" id="ufoId" name="ufo id" placeholder="1234567" />
                                        <Button variant="info">Run Report</Button>
                                    </div>
                                </Form>
                            </div>

                            <div className="c-sidebar__input-group">
                                <Form className="c-leg-org-count">
                                    <Form.Group>
                                        <Form.Label htmlFor="legExt">Leg Ext</Form.Label>
                                        <Form.Control type="text" id="legExt" name="Leg Ext" placeholder="001" />
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label htmlFor="orgSide">Org Side</Form.Label>
                                        <Form.Select id="orgSide">
                                            <option value="1" selected>Both</option>
                                            <option value="2">Left</option>
                                            <option value="3">Right</option>
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Label htmlFor="country">Country</Form.Label>
                                        <Form.Select id="country">
                                            <option value="1" selected>USA</option>
                                            <option value="2">GBR</option>
                                            <option value="3">HKG</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Form>
                            </div>

                            <div className="c-ledgers">
                                <p className="c-title">Ledgers</p>
                                <p className="c-sponsored">Personally Sponsored</p>
                                <p className="c-not-sponsored">Not Personally Sponsored</p>
                            </div>

                            <div className="c-filter">
                                <p className="c-title">Quick Filter</p>
                                <Form>
                                    <Form.Label className="c-flex-form" htmlFor="fName">First Name</Form.Label>
                                    <Form.Control className="w-auto" type="text" id="fName" name="first name" placeholder="Greg" />
                                    <Form.Label className="c-flex-form" htmlFor="lName">Last Name</Form.Label>
                                    <Form.Control className="w-auto" type="text" id="lName" name="last name" placeholder="Johnson" />
                                </Form>
                            </div>

                            <div className="c-list">
                                <p className="c-title">Click on a name to generate a report</p>
                                <Accordion defaultActiveKey="0">
                                    <Accordion.Item eventKey="0">
                                        <Accordion.Header>
                                            <div className="c-list__header">All UFOs (6)</div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <div className="c-list__grid p-b-10">
                                                <span>Gen</span>
                                                <span>First Name</span>
                                                <span>Last Name</span>
                                                <span>BDC</span>
                                                <span>Side</span>
                                            </div>
                                            <ListGroup defaultActiveKey="#Link1">
                                                <ListGroup.Item action href="#link1">
                                                    <div className="c-list__grid">
                                                        <span>1</span>
                                                        <span>Dave</span>
                                                        <span>Tim</span>
                                                        <span>001</span>
                                                        <span>left</span>
                                                    </div>
                                                </ListGroup.Item>
                                                <ListGroup.Item action href="#link2">
                                                    <div className="c-list__grid">
                                                        <span>2</span>
                                                        <span>Greg</span>
                                                        <span>Bag</span>
                                                        <span>002</span>
                                                        <span>left</span>
                                                    </div>
                                                </ListGroup.Item>
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>
                        </div> */}
                        <OrgChart
                            data={data}
                            renderTooltip={() => <TooltipComponent text={text} />}
                            searchNeedle={searchQuery}
                            onSearch={(data, searchQuery) =>
                                data.name.toLowerCase().includes(searchQuery.toLowerCase())
                            }
                        >
                            <Overview />
                            <Controls buttons={OrgChartControlButtons} />
                        </OrgChart>
                    </div>
                </div>
            </div>
        </div>
    );
}