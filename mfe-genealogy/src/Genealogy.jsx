import { useState } from 'react';

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

const TooltipComponent = ({ text }) => (
	<div style={{
		backgroundColor: "#000",
		padding: 5,
		borderRadius: 10,
		color: "#fff",
	}}>
		{text}
	</div>
);

export default function Genealogy() {
	const [searchQuery, setSearchQuery] = useState("");

	return (
		<div className="Genealogy">
			<div className="mfe-genealogy">
				<div className="app">
					<div className="group">
						<div className="sidebar">
							<div className="sidebar__input-group">
								<Form>
									<Form.Label
										className="flex-form"
										htmlFor="ufoId">
										Starting Point UFO ID#
									</Form.Label>
									<br />
									<div className="search__with-button">
										<Form.Control 
											className="w-auto" 
											type="text" 
											id="ufoId" 
											name="ufo id" 
											placeholder="1234567" />
										<Button variant="info">
											Run Report
										</Button>
									</div>
								</Form>
							</div>

							<div className="sidebar__input-group">
								<Form className="leg-org-count">
									<Form.Group>
										<Form.Label htmlFor="legExt">
											Leg Ext
										</Form.Label>
										<br />
										<Form.Control 
											type="text" 
											id="legExt" 
											name="Leg Ext" 
											placeholder="001" />
									</Form.Group>
									<Form.Group>
										<Form.Label htmlFor="orgSide">
											Org Side
										</Form.Label>
										<Form.Select
											id="orgSide"
											defaultValue="Both">
											<option value="1">Both</option>
											<option value="2">Left</option>
											<option value="3">Right</option>
										</Form.Select>
									</Form.Group>
									<Form.Group>
										<Form.Label htmlFor="country">
											Country
										</Form.Label>
										<Form.Select
											id="country"
											defaultValue="USA">
											<option value="1">USA</option>
											<option value="2">GBR</option>
											<option value="3">HKG</option>
										</Form.Select>
									</Form.Group>
								</Form>
							</div>

							{/*<div className="ledgers">
								<p className="title">
									Ledgers
								</p>
								<p className="sponsored">
									Personally Sponsored
								</p>
								<p className="not-sponsored">
									Not Personally Sponsored
								</p>
							</div>*/}

							<div className="filter">
								<p className="title">
									Quick Filter
								</p>
								<Form>
									<Form.Label 
										className="flex-form" 
										htmlFor="fName">
										First Name
									</Form.Label>
									<br />
									<Form.Control 
										className="w-auto" 
										type="text" 
										id="fName" 
										name="first name" 
										placeholder="Greg" />
									<br />
									<Form.Label 
										className="flex-form" 
										htmlFor="lName">
										Last Name
									</Form.Label>
									<br />
									<Form.Control 
										className="w-auto" 
										type="text" 
										id="lName" 
										name="last name" 
										placeholder="Johnson" />
								</Form>
							</div>

							<div className="list">
								<p className="title">
									Click on a name to generate a report
								</p>
								<Accordion defaultActiveKey="0">
									<Accordion.Item eventKey="0">
										<Accordion.Header>
											<div className="list__header">
												All UFOs (6)
											</div>
										</Accordion.Header>
										<Accordion.Body>
											<div className="list__grid p-b-10">
												<span>Gen</span>
												<span>First Name</span>
												<span>Last Name</span>
												<span>BDC</span>
												<span>Side</span>
											</div>
											<ListGroup defaultActiveKey="#Link1">
												<ListGroup.Item action href="#link1">
													<div className="list__grid">
														<span>1</span>
														<span>Dave</span>
														<span>Tim</span>
														<span>001</span>
														<span>left</span>
													</div>
												</ListGroup.Item>
												<ListGroup.Item action href="#link2">
													<div className="list__grid">
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
						</div>
						{console.log(data,searchQuery)}
						<OrgChart
							data={data}
							searchNeedle={searchQuery}
							renderTooltip={(data) => <TooltipComponent text={data.data.position} />}
							/*onSearch={(data, searchQuery) => console.log(data, searchQuery)}*/
							onItemSelect={(data) => console.log('Search Attributes:',data,{
								name: data[0].name,
								subordinates: data[0].subordinates.length,
								ufoId: data[0].ufoId
							})}>
							<Overview />
							<Controls buttons={OrgChartControlButtons} />
						</OrgChart>
					</div>
				</div>
			</div>
		</div>
	);
}