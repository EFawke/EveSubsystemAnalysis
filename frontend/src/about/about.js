import React from "react";
import { Flex, Text} from "@radix-ui/themes";
import PageTitle from "../layout/PageTitle";


class About extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
        }
    }

    render() {
        return (
            <Flex width="100%" maxWidth="700px" direction="column" gap="2">
                <Text size="4" color="gray">
                    Eve Subsystem Analysis is a tool built for the purpose of maximising profits in Tech 3 subsystem production in Eve Online. The website contians three pages which each work together in order to further this aim.
                    </Text>
                    <Text size="4" color="gray">
                    The dashboard/home page contains a table of suggested subsystems. These are the 10 most destroyed subsystems in the past week, ordered by the current sell price. Percentage changes, in that table or throughout the site indicate the 30 day median delta for that value.
                </Text>
                <Text size="4" color="gray">
                    To delve further into a particular subsystem, you can click on its name, and you will be taken to the interactive chart page. This page allows you to compare even more stats regarding the current market conditions of a given subsystem and visualise this data in a biaxial chart. Finally, the build page lets you simulate the production of subsystems, and analyse the material prices, and industry taxes that you'll have to factor in.
                </Text>
                <PageTitle pageTitle="Build page" />
                <Text size="4" color="gray">
                    Building subsystems is usually a 4 step process: reactions, components, blueprints, final product. Currently, the build page for this tool provides the base materials required for all of these steps given your skills, desired production scale, stations, etc. This makes it easy to know what your manufacturing costs are going to be. These settings are stored as cookies, so they'll be the same the next time you use the website also.
                </Text>
                <Text size="4" color="gray">
                    All subsystems of the same type, regardless of the faction, or what type of subsystem it is, have the exact same input requirements - excluding the blueprint copy, which can be produced very late in production. So, this means that a Tengu Defensive - Covert Reconfiguration subsystem will be made from the exact same base materials as a Legion Defensive - Augmented Durability subsystem.
                </Text>
                <Text size="4" color="gray">
                    This factor has been taken into account when designing the build page, as due to the volatility of the subsystem market, it can make sense to produce a large number of each kind of subsystem (Defensive, Core, Propulsion and Offensive) and then run invention jobs at the end, once it's clear which ones are currently selling well.
                </Text>
                <PageTitle pageTitle="Thanks" />
                <Text size="4" color="gray">
                    If you'd like to send me some ISK in game, you can send it to Tradesy, who will use it to buy a lot of Neurovisual Input Matrices. Also thanks to Monoli Rotineque, Khaza Elliott, Wyran, Ionis en Gravonere, Daenmdir, and many other people for their feedback and support throughout the development of this project!
                </Text>
            </Flex>
        );
    }
}

export default About;