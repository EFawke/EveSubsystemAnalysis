import React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import classNames from "classnames";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import "./accordion-styles.css";
import { Slider, TextField, Flex, Select, Text } from "@radix-ui/themes";

const SettingsAccordion = (props) => (
	// console.log(props),
	<Accordion.Root className="AccordionRoot" type="single" collapsible width="100%">
		<Accordion.Item className="AccordionItem" value="item-1">
			<AccordionTrigger>Refinery</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Refinery</Text>
							<Select.Root style={{ width: "100%" }} defaultValue={props.refinery} onValueChange={(value) => props.handleInputChange(value, 'refinery')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Refinery</Select.Label>
										<Select.Item value="Athanor">Athanor</Select.Item>
										<Select.Item value="Tatara">Tatara</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
						{props.refinery === "Tatara" && (
							<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
								<Text size="2" style={{ color: "var(--accent-a11)" }}>Rig</Text>
								<Select.Root defaultValue={props.tataraRig} onValueChange={(value) => props.handleInputChange(value, 'tataraRig')}>
									<Select.Trigger />
									<Select.Content>
										<Select.Group>
											<Select.Label>Rig</Select.Label>
											<Select.Item value="None">None</Select.Item>
											<Select.Item value="T1">T1</Select.Item>
											<Select.Item value="T2">T2</Select.Item>
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</Flex>
						)}
						{props.refinery === "Athanor" && (
							<>
								<Flex direction="column" gap="1" align="start" style={{ width: "100%" }} justify="between">
									<Text size="2" style={{ color: "var(--accent-a11)" }}>Time Efficiency Rig</Text>
									<Select.Root defaultValue={props.teRig || "None"} onValueChange={props.handleInputChange}>
										<Select.Trigger />
										<Select.Content>
											<Select.Group>
												<Select.Label>T.E. Rig</Select.Label>
												<Select.Item value="None">None</Select.Item>
												<Select.Item value="T1">T1</Select.Item>
												<Select.Item value="T2">T2</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</Flex>
								<Flex direction="column" gap="1" align="start" style={{ width: "100%" }} justify="between">
									<Text size="2" style={{ color: "var(--accent-a11)" }}>Material Efficiency Rig</Text>
									<Select.Root defaultValue={props.meRig || "None"} onValueChange={props.handleInputChange}>
										<Select.Trigger />
										<Select.Content>
											<Select.Group>
												<Select.Label>T.E. Rig</Select.Label>
												<Select.Item value="None">None</Select.Item>
												<Select.Item value="T1">T1</Select.Item>
												<Select.Item value="T2">T2</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</Flex>
							</>
						)}
					</Flex>
					<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>System Type</Text>
							<Select.Root defaultValue={props.location || "wormhole"} onValueChange={(value) => props.handleInputChange(value, 'location')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Location</Select.Label>
										<Select.Item value="lowsec">Low Sec</Select.Item>
										<Select.Item value="nullsec">Null Sec</Select.Item>
										<Select.Item value="wormhole">Wormhole</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Reaction System Cost Index</Text>
							<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.reactionCostIndex} onChange={(e) => props.handleInputChange(e.target.value, 'reactionCostIndex')} />
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Facility Tax</Text>
							<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.reactionFacilityTax} onChange={(e) => props.handleInputChange(e.target.value, 'reactionFacilityTax')} />
						</Flex>
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
		<Accordion.Item className="AccordionItem" value="item-2">
			<AccordionTrigger>Manufacturing Complex</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Manufacturing Complex</Text>
							<Select.Root style={{ width: "100%" }} defaultValue={props.complex} onValueChange={(value) => props.handleInputChange(value, 'complex')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Manufacturing Complex</Select.Label>
										<Select.Item value="Raitaru">Raitaru</Select.Item>
										<Select.Item value="Azbel">Azbel</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
						{props.complex === "Azbel" && (
							<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
								<Text size="2" style={{ color: "var(--accent-a11)" }}>Rig</Text>
								<Select.Root defaultValue={props.complexLargeRig} onValueChange={(value) => props.handleInputChange(value, 'complexLargeRig')}>
									<Select.Trigger />
									<Select.Content>
										<Select.Group>
											<Select.Label>Rig</Select.Label>
											<Select.Item value="None">None</Select.Item>
											<Select.Item value="T1">T1</Select.Item>
											<Select.Item value="T2">T2</Select.Item>
										</Select.Group>
									</Select.Content>
								</Select.Root>
							</Flex>
						)}
						{props.complex === "Raitaru" && (
							<>
								<Flex direction="column" gap="1" align="start" style={{ width: "100%" }} justify="between">
									<Text size="2" style={{ color: "var(--accent-a11)" }}>Time Efficiency Rig</Text>
									<Select.Root defaultValue={props.complexTeRig || "None"} onValueChange={(value) => props.handleInputChange(value, 'complexTeRig')}>
										<Select.Trigger />
										<Select.Content>
											<Select.Group>
												<Select.Label>Time Efficiency Rig</Select.Label>
												<Select.Item value="None">None</Select.Item>
												<Select.Item value="T1">T1</Select.Item>
												<Select.Item value="T2">T2</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</Flex>
								<Flex direction="column" gap="1" align="start" style={{ width: "100%" }} justify="between">
									<Text size="2" style={{ color: "var(--accent-a11)" }}>Material Efficiency Rig</Text>
									<Select.Root defaultValue={props.complexMeRig || "None"} onValueChange={(value) => props.handleInputChange(value, 'complexMeRig')}>
										<Select.Trigger />
										<Select.Content>
											<Select.Group>
												<Select.Label>Material Efficiency Rig</Select.Label>
												<Select.Item value="None">None</Select.Item>
												<Select.Item value="T1">T1</Select.Item>
												<Select.Item value="T2">T2</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								</Flex>
							</>
						)}
					</Flex>
					<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>System Type</Text>
							<Select.Root defaultValue={props.complexSystem || "wormhole"} onValueChange={(value) => props.handleInputChange(value, 'complexSystem')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Location</Select.Label>
										<Select.Item value="lowsec">Low Sec</Select.Item>
										<Select.Item value="nullsec">Null Sec</Select.Item>
										<Select.Item value="wormhole">Wormhole</Select.Item>
										<Select.Item value="highsec">High Sec</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Build System Cost Index</Text>
							<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.buildCostIndex || 0.14} onChange={(e) => props.handleInputChange(e.target.value, 'buildCostIndex')} />
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Facility Tax</Text>
							<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.complexFacilityTax || 0.25} onChange={(e) => props.handleInputChange(e.target.value, 'complexFacilityTax')} />
						</Flex>
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
		<Accordion.Item className="AccordionItem" value="item-3">
			<AccordionTrigger>Blueprints</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="4" align="start" style={{ width: "100%" }}>
						<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Component Mat. Efficiency</Text>
							<Slider name="componentMaterialEfficiency" min={0} step={1} max={10} defaultValue={[10]} onValueCommit={(e) => props.handleSliderChange(e, "componentMaterialEfficiency")}/>
						</Flex>
						<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Component Time Efficiency</Text>
							<Slider name="componentTimeEfficiency" min={0} step={1} max={20} defaultValue={[20]} onValueCommit={(e) => props.handleSliderChange(e, "componentTimeEfficiency")}/>
						</Flex>
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
		<Accordion.Item className="AccordionItem" value="item-4">
			<AccordionTrigger>Invention</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="2" align="start" style={{ width: "100%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Ancient Relic</Text>
							<Select.Root defaultValue={props.ancientRelic || "Intact"} onValueChange={(value) => props.handleInputChange(value, 'ancientRelic')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Ancient Relic</Select.Label>
										<Select.Item value="Wrecked">Wrecked</Select.Item>
										<Select.Item value="Malfunctioning">Malfunctioning</Select.Item>
										<Select.Item value="Intact">Intact</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Decryptor</Text>
							<Select.Root defaultValue={props.decryptor || "None"} onValueChange={(value) => props.handleInputChange(value, 'decryptor')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Decryptor</Select.Label>
										<Select.Item value="None">None</Select.Item>
										<Select.Item value="Accelerant Decryptor">Accelerant Decryptor</Select.Item>
										<Select.Item value="Attainment Decryptor">Attainment Decryptor</Select.Item>
										<Select.Item value="Augmentation Decryptor">Augmentation Decryptor</Select.Item>
										<Select.Item value="Optimized Attainment Decryptor">Optimized Attainment Decryptor</Select.Item>
										<Select.Item value="Optimized Augmentation Decryptor">Optimized Augmentation Decryptor</Select.Item>
										<Select.Item value="Parity Decryptor">Parity Decryptor</Select.Item>
										<Select.Item value="Process Decryptor">Process Decryptor</Select.Item>
										<Select.Item value="Symmetry Decryptor">Symmetry Decryptor</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
		<Accordion.Item className="AccordionItem" value="item-5">
			<AccordionTrigger>Build Volume</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="1" align="start" style={{ width: "50%" }}>
						<Text size="2" style={{ color: "var(--accent-a11)" }}>Core</Text>
						<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.coreVolume} onChange={(e) => props.handleInputChange(e.target.value, 'coreVolume')} />
						<Text size="2" style={{ color: "var(--accent-a11)" }}>Defensive</Text>
						<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.defensiveVolume} onChange={(e) => props.handleInputChange(e.target.value, 'defensiveVolume')} />
					</Flex>
					<Flex direction="column" gap="1" align="start" style={{ width: "50%" }}>
						<Text size="2" style={{ color: "var(--accent-a11)" }}>Offensive</Text>
						<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.offensiveVolume} onChange={(e) => props.handleInputChange(e.target.value, 'offensiveVolume')} />
						<Text size="2" style={{ color: "var(--accent-a11)" }}>Propulsion</Text>
						<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.propulsionVolume} onChange={(e) => props.handleInputChange(e.target.value, 'propulsionVolume')} />
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
		<Accordion.Item className="AccordionItem" value="item-6">
			<AccordionTrigger>Character</AccordionTrigger>
			<AccordionContent>
				<Flex direction="row" align="start" style={{ width: "100%" }} justify="between" mt="2" mb="2">
					<Flex direction="column" gap="4" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Reaction Slots</Text>
							<TextField.Root style={{ maxWidth: "100px" }} type="number" value={props.numSlots} onChange={(e) => props.handleInputChange(e.target.value, 'numSlots')} />
						</Flex>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Skill Level</Text>
							<Slider name="skillLevel" min={0} step={1} max={5} defaultValue={[Number(props.skillLevel)]} onValueCommit={(e) => props.handleSliderChange(e, "skillLevel")}/>	
						</Flex>
					</Flex>
					<Flex direction="column" gap="2" align="start" style={{ width: "50%" }}>
						<Flex direction="column" gap="1" align="start" style={{ width: "100%" }}>
							<Text size="2" style={{ color: "var(--accent-a11)" }}>Implant</Text>
							<Select.Root defaultValue={props.implant} onValueChange={(value) => props.handleInputChange(value, 'implant')}>
								<Select.Trigger />
								<Select.Content>
									<Select.Group>
										<Select.Label>Implant</Select.Label>
										<Select.Item value="None">None</Select.Item>
										<Select.Item value="1%">1%</Select.Item>
										<Select.Item value="2%">2%</Select.Item>
										<Select.Item value="4%">4%</Select.Item>
									</Select.Group>
								</Select.Content>
							</Select.Root>
						</Flex>
					</Flex>
				</Flex>
			</AccordionContent>
		</Accordion.Item>
	</Accordion.Root>
);

const AccordionTrigger = React.forwardRef(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Header className="AccordionHeader" >
			<Accordion.Trigger className={classNames("AccordionTrigger", className)} {...props} ref={forwardedRef}>
				{children}
				<ChevronDownIcon className="AccordionChevron" aria-hidden />
			</Accordion.Trigger>
		</Accordion.Header>
	),
);

const AccordionContent = React.forwardRef(
	({ children, className, ...props }, forwardedRef) => (
		<Accordion.Content className={classNames("AccordionContent", className)} {...props} ref={forwardedRef}>
			<div className="AccordionContentText">{children}</div>
		</Accordion.Content>
	),
);

export default SettingsAccordion;