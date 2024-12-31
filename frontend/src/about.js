import React from "react";
import { Flex, Heading, Text, Blockquote} from "@radix-ui/themes";
import PageTitle from "./PageTitle";


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
                    Eve Subsystem Analysis started out with a moment of frustration. I had built some subsystems for the market and they just weren't selling. So I decided to look a bit into the market and see which subsystems were getting destroyed in the game the most.
                    </Text>
                    <Text size="4" color="gray">
                    Clearly getting this data by perusing zkillboard and tallying them all up wasn't something I could do by hand. The task needed automating so I wrote a simple script. It got all of the subsystems lost in the available data on zkill's api and tallied the names and totals in an array.
                </Text>
                <Text size="4" color="gray">
                    It turned out that this was a useful predictor of player demand for specific subsystems. It was in some sense, revealing the current T3 meta, and brought new meaning to the often ushered words amongst Eve's players, "Already replaced". Intreagued by this insight I decided to make a kind of Bloomberg Terminal for the way that I earn my isk in the game. 
                </Text>
                <PageTitle pageTitle="Why subsystems?" />
                <Text size="4" color="gray">
                    The reason I like the subsystem market in particular has been summarized by another player better than I could:
                </Text>
                <Blockquote size="4" color="gray">
                "...this is a volume business. You can get a lot of turnover very quickly and you can serve a wide diversity of end products with a pretty standard production chain..." - Pietro Da Napoli
                </Blockquote>
                <Text size="4" color="gray">
                    The market is also pretty niche, and you can decide first that you're going to build, say, 220 defensive subsystems, and later decide which specific ones you'll produce. This rewards the ability to adapt to current demand excessively.
                </Text>
                <PageTitle pageTitle="How does it work?" />
                <Text size="4" color="gray">
                    The code for this has been through many iterations and two full versions. With several changes to the fundamental way it gathers data, and ui tweaks in how the information is presented to the user (I would like to especially thank Monoli, who's help was instrumental to the improvement of the design in several ways). New to version two is the build calculator, which takes the user's settings and spits out the base material requirements (which was a nightmare to code).
                </Text>
                <Text size="4" color="gray">
                    If you found this website useful, please send some isk to Tradesy.
                </Text>
            </Flex>
        );
    }
}

export default About;