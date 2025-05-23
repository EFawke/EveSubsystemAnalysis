import { Flex, Link, Text, Container } from "@radix-ui/themes";

const Footer = () => {
    return (
        <Container className="mobile_padding" size="4" style={{ background: "var(--gray-a2)", alignSelf: "end", width: "100%" }} mt="5">
            <Flex mt="5" mb="5" width="100%" justify="between" align="center">
                <Text size="3">
                    All EVE related materials are property of <Link href="https://www.ccpgames.com/">CCP Games</Link>
                </Text>
            </Flex>
            <Flex direction="column" gap="2" mt="5" mb="5" width="100%" justify="between" align="start">
                <Link href="/"><Text size="3">Home</Text></Link>
                <Link href="/build"><Text size="3">Build</Text></Link>
                <Link href="/about"><Text size="3">About</Text></Link>
            </Flex>
        </Container>
    );
}

export default Footer;
